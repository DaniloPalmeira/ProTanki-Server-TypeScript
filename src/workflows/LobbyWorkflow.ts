import { Achievement } from "../models/enums/Achievement";
import { ChatModeratorLevel } from "../models/enums/ChatModeratorLevel";
import AchievementTips from "../packets/implementations/AchievementTips";
import AntifloodSettings from "../packets/implementations/AntifloodSettings";
import ChatHistory from "../packets/implementations/ChatHistory";
import ChatProperties from "../packets/implementations/ChatProperties";
import ConfirmLayoutChange from "../packets/implementations/ConfirmLayoutChange";
import EmailInfo from "../packets/implementations/EmailInfo";
import FriendsList from "../packets/implementations/FriendsList";
import LocalizationInfo from "../packets/implementations/LocalizationInfo";
import LobbyData from "../packets/implementations/LobbyData";
import PremiumInfo from "../packets/implementations/PremiumInfo";
import ReferralInfo from "../packets/implementations/ReferralInfo";
import SetBattleInviteSound from "../packets/implementations/SetBattleInviteSound";
import SetLayout from "../packets/implementations/SetLayout";
import { IChatMessageData } from "../packets/interfaces/IChatHistory";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { ChatService } from "../services/ChatService";
import { ConfigService } from "../services/ConfigService";
import { UserService } from "../services/UserService";
import { FormatUtils } from "../utils/FormatUtils";
import logger from "../utils/Logger";
import { ResourceManager } from "../utils/ResourceManager";

export class LobbyWorkflow {
  public static async enterLobby(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    const user = client.user!;
    const configs = await ConfigService.getAllConfigs();

    // 1. Mudar e confirmar layout
    client.sendPacket(new SetLayout(0));
    client.sendPacket(new ConfirmLayoutChange(0, 0));

    // 2. Informações de Premium
    let premiumSecondsLeft = 0;
    if (user.premiumExpiresAt && user.premiumExpiresAt > new Date()) {
      premiumSecondsLeft = Math.round((user.premiumExpiresAt.getTime() - Date.now()) / 1000);
    }
    client.sendPacket(new PremiumInfo(premiumSecondsLeft));

    // 3. Informações de Localização
    const countries: [string, string][] = [
      ["BR", "Brazil"],
      ["US", "United States"],
      ["RU", "Russia"],
    ];
    client.sendPacket(new LocalizationInfo(countries, "BR", true));

    // 4. Dados do Usuário para o Painel (Patente, cristais, etc.)
    let crystalAbonementSecondsLeft = 0;
    if (user.crystalAbonementExpiresAt && user.crystalAbonementExpiresAt > new Date()) {
      crystalAbonementSecondsLeft = Math.round((user.crystalAbonementExpiresAt.getTime() - Date.now()) / 1000);
    }

    client.sendPacket(
      new LobbyData({
        crystals: user.crystals,
        currentRankScore: user.score,
        durationCrystalAbonement: crystalAbonementSecondsLeft,
        hasDoubleCrystal: user.hasDoubleCrystal,
        nextRankScore: user.nextRankScore,
        place: 0,
        rank: user.rank,
        rating: 0,
        score: user.score,
        serverNumber: 1,
        nickname: user.username,
        userProfileUrl: "http://ratings.example.com/pt_br/user/",
      })
    );

    // 5. Informações de E-mail
    const maskedEmail = user.email ? FormatUtils.maskEmail(user.email) : null;
    client.sendPacket(new EmailInfo(maskedEmail, user.emailConfirmed));

    // 6. Som de convite para batalha
    const battleInviteSoundId = ResourceManager.getIdlowById("sounds/notifications/battle_invite");
    client.sendPacket(new SetBattleInviteSound(battleInviteSoundId));

    // 7. Dicas de conquistas para novos jogadores
    const tipsToSend: Achievement[] = [];
    if (!user.unlockedAchievements.includes(Achievement.FIRST_PURCHASE)) {
      tipsToSend.push(Achievement.FIRST_PURCHASE);
    }
    if (!user.unlockedAchievements.includes(Achievement.FIGHT_FIRST_BATTLE)) {
      tipsToSend.push(Achievement.FIGHT_FIRST_BATTLE);
    }
    client.sendPacket(new AchievementTips(tipsToSend));

    // 8. Informações de Referência
    client.sendPacket(new ReferralInfo(user.referralHash, "s.pro-tanki.com"));

    // 9. Propriedades do Chat
    let linksWhitelist: string[] = [];
    try {
      linksWhitelist = JSON.parse(configs.chatLinksWhitelist || "[]");
    } catch (e) {
      logger.error("Failed to parse chatLinksWhitelist", { error: e });
    }

    client.sendPacket(
      new ChatProperties({
        admin: user.chatModeratorLevel === ChatModeratorLevel.ADMINISTRATOR,
        antifloodEnabled: configs.chatAntifloodEnabled === "true",
        bufferSize: parseInt(configs.chatBufferSize || "60"),
        chatEnabled: configs.chatEnabled === "true",
        chatModeratorLevel: user.chatModeratorLevel,
        linksWhiteList: linksWhitelist,
        minChar: parseInt(configs.chatMinChar || "60"),
        minWord: parseInt(configs.chatMinWord || "5"),
        selfName: user.username,
        showLinks: configs.chatShowLinks === "true",
        typingSpeedAntifloodEnabled: configs.chatTypingSpeedAntifloodEnabled === "true",
      })
    );

    // 10. Configurações de Anti-flood
    client.sendPacket(new AntifloodSettings(parseInt(configs.chatCharDelayFactor || "176"), parseInt(configs.chatMessageBaseDelay || "880")));

    // 11. Histórico do Chat
    const historyLimit = parseInt(configs.chatHistoryLimit || "70");
    const messages = await ChatService.getChatHistory(historyLimit);
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

  public static async sendFriendsList(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) return;

    const friendsData = await UserService.getFriendsData(client.user.id);
    client.sendPacket(new FriendsList(friendsData));
  }
}
