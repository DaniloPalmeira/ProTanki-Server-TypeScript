import { battleDataObject } from "@/config/BattleData";
import { CALLBACK } from "@/config/constants";
import { HideLoginForm, Punishment } from "@/features/authentication/auth.packets";
import { Battle, BattleMode, EquipmentConstraintsMode } from "@/features/battle/battle.model";
import { BattleWorkflow } from "@/features/battle/battle.workflow";
import * as ChatPackets from "@/features/chat/chat.packets";
import { PopulatedChatMessage } from "@/features/chat/chat.service";
import { IChatMessageData } from "@/features/chat/chat.types";
import { UnloadGaragePacket } from "@/features/garage/garage.packets";
import { LoadDependencies } from "@/features/loader/loader.packets";
import { AchievementTips, EmailInfo, PremiumInfo } from "@/features/profile/profile.packets";
import { ReferralInfo } from "@/features/referral/referral.packets";
import { LocalizationInfo } from "@/features/shop/shop.packets";
import { ConfirmLayoutChange, SetLayout } from "@/features/system/system.packets";
import { Achievement } from "@/models/enums/Achievement";
import { ChatModeratorLevel } from "@/models/enums/ChatModeratorLevel";
import { UserDocument, UserDocumentWithFriends } from "@/models/User";
import SetBattleInviteSound from "@/packets/implementations/SetBattleInviteSound";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { ResourceId } from "@/types/resourceTypes";
import { FormatUtils } from "@/utils/FormatUtils";
import logger from "@/utils/Logger";
import { ResourceManager } from "@/utils/ResourceManager";
import * as LobbyPackets from "./lobby.packets";
import { UnloadBattleListPacket } from "./lobby.packets";

const mapUserToObject = (user: UserDocument) => ({
    kills: 0,
    score: 0,
    suspicious: false,
    user: user.username,
});

export class LobbyWorkflow {
    public static async enterLobby(client: ProTankiClient, server: ProTankiServer): Promise<void> {
        if (!client.user) {
            logger.error("Attempted to enter lobby without a user authenticated.", { client: client.getRemoteAddress() });
            return;
        }

        const populatedUser = (await client.user.populate("friends", "username")) as UserDocumentWithFriends;
        client.friendsCache = populatedUser.friends.map((friend) => friend.username);
        logger.info(`Friends list for ${client.user.username} cached with ${client.friendsCache.length} friends.`);

        await this.returnToLobby(client, server, false);
    }

    public static async postAuthenticationFlow(client: ProTankiClient, server: ProTankiServer): Promise<boolean> {
        const user = client.user!;

        if (user.isPunished && user.punishmentExpiresAt && user.punishmentExpiresAt > new Date()) {
            const now = new Date();
            const timeLeftMs = user.punishmentExpiresAt.getTime() - now.getTime();
            const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

            client.sendPacket(new Punishment(user.punishmentReason, days, hours, minutes));
            logger.info(`Punished user ${user.username} attempted to login`, { client: client.getRemoteAddress() });
            return false;
        }

        client.sendPacket(new HideLoginForm());
        this.sendPlayerVitals(user, client, server);
        this.sendInitialSettings(client, server);
        this.sendAchievementTips(user, client);

        const reconnectData = server.battleService.handlePlayerReconnection(user);
        if (reconnectData) {
            const battle = server.lobbyService.getBattleById(reconnectData.battleId);
            if (battle) {
                logger.info(`User ${user.username} is reconnecting to battle ${battle.battleId}`);
                client.currentBattle = battle;

                server.notifySubscribersOfStatusChange(user.username, true);
                await BattleWorkflow.enterBattle(client, server, battle);
                return true;
            }
        }

        await LobbyWorkflow.enterLobby(client, server);
        server.notifySubscribersOfStatusChange(user.username, true);

        return true;
    }

    public static async returnToLobby(client: ProTankiClient, server: ProTankiServer, fromGarage: boolean = true): Promise<void> {
        if (fromGarage) {
            client.sendPacket(new UnloadGaragePacket());
        }

        if (client.user && !client.isChatLoaded) {
            await this.sendChatSetup(client.user, client, server);
        }

        client.setState("chat_lobby");
        client.sendPacket(new SetLayout(0));

        const resourceIds: ResourceId[] = [];
        const dependencies = { resources: ResourceManager.getBulkResources(resourceIds) };
        client.sendPacket(new LoadDependencies(dependencies, CALLBACK.LOBBY_DATA));
    }

    public static enterBattleLobbyView(client: ProTankiClient, server: ProTankiServer): void {
        client.setState("battle_lobby");
        client.sendPacket(new SetLayout(0));
        client.sendPacket(new LoadDependencies({ resources: [] }, CALLBACK.LOBBY_DATA));
        client.sendPacket(new ConfirmLayoutChange(3, 0));
    }

    public static transitionFromGarageToLobby(client: ProTankiClient, server: ProTankiServer): void {
        client.sendPacket(new UnloadGaragePacket());
        this.enterBattleLobbyView(client, server);
    }

    public static returnToBattleView(client: ProTankiClient, server: ProTankiServer): void {
        client.setState("battle");
        client.sendPacket(new SetLayout(3));
        client.sendPacket(new UnloadBattleListPacket());
        client.sendPacket(new ConfirmLayoutChange(3, 3));
    }

    public static async initializeLobby(client: ProTankiClient, server: ProTankiServer): Promise<void> {
        this.sendBattleInfo(client);
        this.sendBattleList(client, server);

        let targetBattle: Battle | undefined;

        if (client.lastViewedBattleId) {
            targetBattle = server.lobbyService.getBattleById(client.lastViewedBattleId);
        }

        if (!targetBattle && client.user) {
            targetBattle = server.lobbyService.findBattleForPlayer(client.user);
        }

        if (targetBattle) {
            client.lastViewedBattleId = targetBattle.battleId;
            await this.sendBattleDetails(client, server, targetBattle);
        }

        client.sendPacket(new ConfirmLayoutChange(0, 0));
    }

    private static sendPlayerVitals(user: UserDocument, client: ProTankiClient, server: ProTankiServer): void {
        let premiumSecondsLeft = 0;
        if (user.premiumExpiresAt && user.premiumExpiresAt > new Date()) {
            premiumSecondsLeft = Math.round((user.premiumExpiresAt.getTime() - Date.now()) / 1000);
        }
        client.sendPacket(new PremiumInfo(premiumSecondsLeft));

        let crystalAbonementSecondsLeft = 0;
        if (user.crystalAbonementExpiresAt && user.crystalAbonementExpiresAt > new Date()) {
            crystalAbonementSecondsLeft = Math.round((user.crystalAbonementExpiresAt.getTime() - Date.now()) / 1000);
        }

        const rankInfo = server.rankService.getRankById(user.rank);
        const currentRankMinScore = rankInfo ? rankInfo.minScore : 0;

        client.sendPacket(
            new LobbyPackets.LobbyData({
                crystals: user.crystals,
                currentRankScore: currentRankMinScore,
                durationCrystalAbonement: crystalAbonementSecondsLeft,
                hasDoubleCrystal: user.hasDoubleCrystal,
                nextRankScore: user.nextRankScore,
                place: 0,
                rank: user.rank,
                rating: 0,
                score: user.experience,
                serverNumber: 1,
                nickname: user.username,
                userProfileUrl: "http://ratings.example.com/pt_br/user/",
            })
        );

        const maskedEmail = user.email ? FormatUtils.maskEmail(user.email) : null;
        client.sendPacket(new EmailInfo(maskedEmail, user.emailConfirmed));

        client.sendPacket(new ReferralInfo(user.referralHash, "s.pro-tanki.com"));
    }

    private static sendInitialSettings(client: ProTankiClient, server: ProTankiServer): void {
        const countries = server.configService.getShopEnabledCountries();
        const locationSwitchingEnabled = server.configService.getShopLocationSwitchingEnabled();
        client.sendPacket(new LocalizationInfo(countries, "BR", locationSwitchingEnabled));

        const battleInviteSoundId = ResourceManager.getIdlowById("sounds/notifications/battle_invite");
        client.sendPacket(new SetBattleInviteSound(battleInviteSoundId));
    }

    private static sendAchievementTips(user: UserDocument, client: ProTankiClient): void {
        const tipsToSend: Achievement[] = [];
        if (!user.unlockedAchievements.includes(Achievement.FIRST_PURCHASE)) {
            tipsToSend.push(Achievement.FIRST_PURCHASE);
        }
        if (!user.unlockedAchievements.includes(Achievement.FIGHT_FIRST_BATTLE)) {
            tipsToSend.push(Achievement.FIGHT_FIRST_BATTLE);
        }
        client.sendPacket(new AchievementTips(tipsToSend));
    }

    public static async sendChatSetup(user: UserDocument, client: ProTankiClient, server: ProTankiServer): Promise<void> {
        const configService = server.configService;

        client.sendPacket(
            new ChatPackets.ChatProperties({
                admin: user.chatModeratorLevel === ChatModeratorLevel.ADMINISTRATOR,
                antifloodEnabled: configService.getChatAntifloodEnabled(),
                bufferSize: configService.getChatBufferSize(),
                chatEnabled: configService.getChatEnabled(),
                chatModeratorLevel: user.chatModeratorLevel,
                linksWhiteList: configService.getChatLinksWhitelist(),
                minChar: configService.getChatMinChar(),
                minWord: configService.getChatMinWord(),
                selfName: user.username,
                showLinks: configService.getChatShowLinks(),
                typingSpeedAntifloodEnabled: configService.getChatTypingSpeedAntifloodEnabled(),
            })
        );

        client.sendPacket(new ChatPackets.AntifloodSettings(configService.getChatCharDelayFactor(), configService.getChatMessageBaseDelay()));

        const historyLimit = configService.getChatHistoryLimit();
        const messages = await server.chatService.getChatHistory(historyLimit);
        const messageData: IChatMessageData[] = messages.map((msg: PopulatedChatMessage) => ({
            message: msg.message,
            isSystem: msg.isSystemMessage,
            isWarning: msg.isWarning,
            source: msg.sourceUser
                ? {
                    uid: msg.sourceUser.username,
                    rank: msg.sourceUser.rank,
                    moderatorLevel: msg.sourceUser.chatModeratorLevel,
                    ip: null,
                }
                : null,
            target: msg.targetUser
                ? {
                    uid: msg.targetUser.username,
                    rank: msg.targetUser.rank,
                    moderatorLevel: msg.targetUser.chatModeratorLevel,
                    ip: null,
                }
                : null,
        }));
        client.sendPacket(new ChatPackets.ChatHistory(messageData));

        client.isChatLoaded = true;
    }

    private static sendBattleInfo(client: ProTankiClient): void {
        const battleData = JSON.parse(JSON.stringify(battleDataObject));

        battleData.maps.forEach((map: any) => {
            if (map.previewResource) {
                try {
                    map.preview = ResourceManager.getIdlowById(map.previewResource as ResourceId);
                } catch (error) {
                    logger.error(`Failed to get preview resource for map: ${map.previewResource}`, { error });
                    map.preview = 0;
                }
                delete map.previewResource;
            }
        });

        const jsonData = JSON.stringify(battleData);
        client.sendPacket(new LobbyPackets.BattleInfo(jsonData));
    }

    private static sendBattleList(client: ProTankiClient, server: ProTankiServer): void {
        const battles = server.lobbyService.getBattles();

        const battleListPayload = battles.map((battle) => {
            const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
            let preview = 0;
            if (mapInfo) {
                try {
                    preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
                } catch (error) {
                    logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
                }
            }
            const basePayload = {
                battleId: battle.battleId,
                battleMode: BattleMode[battle.settings.battleMode],
                map: battle.settings.mapId,
                maxPeople: battle.settings.maxPeopleCount,
                name: battle.settings.name,
                privateBattle: battle.settings.privateBattle,
                proBattle: battle.settings.proBattle,
                minRank: battle.settings.minRank,
                maxRank: battle.settings.maxRank,
                preview: preview,
                parkourMode: battle.settings.parkourMode,
                equipmentConstraintsMode: EquipmentConstraintsMode[battle.settings.equipmentConstraintsMode],
                suspicionLevel: "NONE",
            };

            if (battle.isTeamMode()) {
                return {
                    ...basePayload,
                    usersBlue: battle.usersBlue.map(mapUserToObject),
                    usersRed: battle.usersRed.map(mapUserToObject),
                };
            } else {
                return {
                    ...basePayload,
                    users: battle.users.map(mapUserToObject),
                };
            }
        });

        const jsonData = JSON.stringify({ battles: battleListPayload });
        client.sendPacket(new LobbyPackets.BattleList(jsonData));
    }

    public static async sendBattleDetails(client: ProTankiClient, server: ProTankiServer, battle: Battle): Promise<void> {
        client.sendPacket(new LobbyPackets.SelectBattlePacket(battle.battleId));

        const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
        let preview = 0;
        if (mapInfo) {
            try {
                preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
            } catch (error) {
                logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
            }
        }

        let timeLeftInSec = battle.settings.timeLimitInSec;
        if (battle.roundStarted && battle.roundStartTime) {
            const elapsedSeconds = Math.floor((Date.now() - battle.roundStartTime) / 1000);
            timeLeftInSec = Math.max(0, battle.settings.timeLimitInSec - elapsedSeconds);
        }

        const baseDetailsPayload = {
            battleMode: BattleMode[battle.settings.battleMode],
            itemId: battle.battleId,
            scoreLimit: battle.settings.scoreLimit,
            timeLimitInSec: battle.settings.timeLimitInSec,
            preview: preview,
            maxPeopleCount: battle.settings.maxPeopleCount,
            name: battle.settings.name,
            proBattle: battle.settings.proBattle,
            minRank: battle.settings.minRank,
            maxRank: battle.settings.maxRank,
            roundStarted: battle.roundStarted,
            spectator: true,
            withoutBonuses: battle.settings.withoutBonuses,
            withoutCrystals: battle.settings.withoutCrystals,
            withoutSupplies: battle.settings.withoutSupplies,
            proBattleEnterPrice: 150,
            timeLeftInSec: timeLeftInSec,
            userPaidNoSuppliesBattle: true,
            proBattleTimeLeftInSec: 1,
            parkourMode: battle.settings.parkourMode,
            equipmentConstraintsMode: EquipmentConstraintsMode[battle.settings.equipmentConstraintsMode],
            reArmorEnabled: battle.settings.reArmorEnabled,
            reducedResistance: battle.settings.reducedResistances,
            esportDropTiming: battle.settings.esportDropTiming,
            withoutGoldBoxes: battle.settings.withoutGoldBoxes,
            withoutGoldSiren: battle.settings.withoutGoldSiren,
            withoutGoldZone: battle.settings.withoutGoldZone,
            withoutMedkit: battle.settings.withoutMedkit,
            withoutMines: battle.settings.withoutMines,
            randomGold: battle.settings.randomGold,
            dependentCooldownEnabled: battle.settings.dependentCooldownEnabled,
        };

        let finalPayload;
        if (battle.isTeamMode()) {
            finalPayload = {
                ...baseDetailsPayload,
                usersBlue: battle.usersBlue.map(mapUserToObject),
                usersRed: battle.usersRed.map(mapUserToObject),
                scoreRed: battle.scoreRed,
                scoreBlue: battle.scoreBlue,
                autoBalance: battle.settings.autoBalance,
                friendlyFire: battle.settings.friendlyFire,
            };
        } else {
            finalPayload = {
                ...baseDetailsPayload,
                users: battle.users.map(mapUserToObject),
            };
        }

        const jsonData = JSON.stringify(finalPayload);
        client.sendPacket(new LobbyPackets.BattleDetails(jsonData));
    }
}