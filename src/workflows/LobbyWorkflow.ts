import { Achievement } from "../models/enums/Achievement";
import { ChatModeratorLevel } from "../models/enums/ChatModeratorLevel";
import { UserDocument } from "../models/User";
import AchievementTips from "../packets/implementations/AchievementTips";
import AntifloodSettings from "../packets/implementations/AntifloodSettings";
import ChatHistory from "../packets/implementations/ChatHistory";
import ChatProperties from "../packets/implementations/ChatProperties";
import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import EmailInfo from "../packets/implementations/EmailInfo";
import FriendsList from "../packets/implementations/FriendsList";
import LocalizationInfo from "../packets/implementations/LocalizationInfo";
import LobbyData from "../packets/implementations/LobbyData";
import OnlineNotifierData from "../packets/implementations/OnlineNotifierData";
import PremiumInfo from "../packets/implementations/PremiumInfo";
import PremiumNotifierData from "../packets/implementations/PremiumNotifierData";
import RankNotifierData from "../packets/implementations/RankNotifierData";
import ReferralInfo from "../packets/implementations/ReferralInfo";
import SetBattleInviteSound from "../packets/implementations/SetBattleInviteSound";
import SetLayout from "../packets/implementations/SetLayout";
import { IChatMessageData } from "../packets/interfaces/IChatHistory";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { FormatUtils } from "../utils/FormatUtils";
import logger from "../utils/Logger";
import { ResourceManager } from "../utils/ResourceManager";
import BattleInfo from "../packets/implementations/BattleInfo";
import { battleDataObject } from "../config/BattleData";
import { ResourceId } from "../types/resourceTypes";
import BattleList from "../packets/implementations/BattleList";
import { Battle, BattleMode, EquipmentConstraintsMode } from "../models/Battle";
import UserNotInBattlePacket from "../packets/implementations/UserNotInBattlePacket";
import BattleDetails from "../packets/implementations/BattleDetails";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import { CALLBACK } from "../config/constants";
import UnloadGaragePacket from "../packets/implementations/UnloadGaragePacket";
import SelectBattlePacket from "../packets/implementations/SelectBattlePacket";

export class LobbyWorkflow {
  public static async enterLobby(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) {
      logger.error("Attempted to enter lobby without a user authenticated.", { client: client.getRemoteAddress() });
      return;
    }

    this.sendPlayerVitals(client.user, client, server);
    this.sendInitialSettings(client, server);
    this.sendAchievementTips(client.user, client);
    await this.sendChatSetup(client.user, client, server);

    this.returnToLobby(client, server, false);
  }

  public static returnToLobby(client: ProTankiClient, server: ProTankiServer, fromGarage: boolean = true): void {
    if (fromGarage) {
      client.sendPacket(new UnloadGaragePacket());
    }

    client.setState("chat_lobby");
    client.sendPacket(new SetLayout(0));

    const resourceIds: ResourceId[] = [];
    const dependencies = { resources: ResourceManager.getBulkResources(resourceIds) };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.LOBBY_DATA));
  }

  public static initializeLobby(client: ProTankiClient, server: ProTankiServer): void {
    this.sendBattleInfo(client);
    this.sendBattleList(client, server);

    let targetBattle: Battle | undefined;

    if (client.lastViewedBattleId) {
      targetBattle = server.battleService.getBattleById(client.lastViewedBattleId);
    }

    if (!targetBattle && client.user) {
      targetBattle = server.battleService.findBattleForPlayer(client.user);
    }

    if (targetBattle) {
      client.sendPacket(new SelectBattlePacket(targetBattle.battleId));
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
      new LobbyData({
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

  private static async sendChatSetup(user: UserDocument, client: ProTankiClient, server: ProTankiServer): Promise<void> {
    const configService = server.configService;

    client.sendPacket(
      new ChatProperties({
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

    client.sendPacket(new AntifloodSettings(configService.getChatCharDelayFactor(), configService.getChatMessageBaseDelay()));

    const historyLimit = configService.getChatHistoryLimit();
    const messages = await server.chatService.getChatHistory(historyLimit);
    const messageData: IChatMessageData[] = messages.map((msg) => ({
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
    client.sendPacket(new ChatHistory(messageData));
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
    client.sendPacket(new BattleInfo(jsonData));
  }

  private static sendBattleList(client: ProTankiClient, server: ProTankiServer): void {
    const battles = server.battleService.getBattles();

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
          usersBlue: battle.usersBlue.map((u) => u.username),
          usersRed: battle.usersRed.map((u) => u.username),
        };
      } else {
        return {
          ...basePayload,
          users: battle.users.map((u) => u.username),
        };
      }
    });

    const jsonData = JSON.stringify({ battles: battleListPayload });
    client.sendPacket(new BattleList(jsonData));
  }

  public static async sendFriendsList(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) return;

    const friendsData = await server.userService.getFriendsData(client.user.id);
    client.sendPacket(new FriendsList(friendsData));
  }

  public static async sendFullUserInfo(client: ProTankiClient, server: ProTankiServer, targetNickname: string): Promise<void> {
    const targetUser = await server.userService.findUserByUsername(targetNickname);
    if (!targetUser) {
      logger.warn(`User info requested for non-existent user: ${targetNickname}`);
      return;
    }

    client.subscriptions.add(targetNickname.toLowerCase());
    logger.info(`Client ${client.user?.username} subscribed to updates for ${targetNickname}`);

    const targetClient = server.findClientByUsername(targetNickname);
    const isOnline = !!targetClient;

    client.sendPacket(new OnlineNotifierData(isOnline, 1, targetUser.username));
    client.sendPacket(new RankNotifierData(targetUser.rank, targetUser.username));

    let premiumSecondsLeft = 0;
    if (targetUser.premiumExpiresAt && targetUser.premiumExpiresAt > new Date()) {
      premiumSecondsLeft = Math.round((targetUser.premiumExpiresAt.getTime() - Date.now()) / 1000);
    }
    client.sendPacket(new PremiumNotifierData(premiumSecondsLeft, targetUser.username));

    const isInBattle = server.battleService.isUserInBattle(targetNickname);
    if (!isInBattle) {
      client.sendPacket(new UserNotInBattlePacket(targetNickname));
    }
  }

  public static async sendBattleDetails(client: ProTankiClient, server: ProTankiServer, battle: Battle): Promise<void> {
    client.sendPacket(new SelectBattlePacket(battle.battleId));

    const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
    let preview = 0;
    if (mapInfo) {
      try {
        preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
      } catch (error) {
        logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
      }
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
      roundStarted: true,
      spectator: false,
      withoutBonuses: battle.settings.withoutBonuses,
      withoutCrystals: battle.settings.withoutCrystals,
      withoutSupplies: battle.settings.withoutSupplies,
      proBattleEnterPrice: 150,
      timeLeftInSec: battle.settings.timeLimitInSec,
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
        usersBlue: battle.usersBlue.map((user) => ({ kills: 0, score: user.experience, suspicious: false, user: user.username })),
        usersRed: battle.usersRed.map((user) => ({ kills: 0, score: user.experience, suspicious: false, user: user.username })),
        scoreRed: battle.scoreRed,
        scoreBlue: battle.scoreBlue,
        autoBalance: battle.settings.autoBalance,
        friendlyFire: battle.settings.friendlyFire,
      };
    } else {
      finalPayload = {
        ...baseDetailsPayload,
        users: battle.users.map((user) => user.username),
      };
    }

    const jsonData = JSON.stringify(finalPayload);
    client.sendPacket(new BattleDetails(jsonData));
  }
}
