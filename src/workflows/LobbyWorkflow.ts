import EmailInfo from "../packets/implementations/EmailInfo";
import LocalizationInfo from "../packets/implementations/LocalizationInfo";
import LobbyData from "../packets/implementations/LobbyData";
import PremiumInfo from "../packets/implementations/PremiumInfo";
import SetLayout from "../packets/implementations/SetLayout";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { FormatUtils } from "../utils/FormatUtils";

export class LobbyWorkflow {
  public static async enterLobby(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    const user = client.user!;

    // LayoutState = 0 = "BATTLE_SELECT"
    client.sendPacket(new SetLayout(0));

    let premiumSecondsLeft = 0;
    if (user.premiumExpiresAt && user.premiumExpiresAt > new Date()) {
      premiumSecondsLeft = Math.round((user.premiumExpiresAt.getTime() - Date.now()) / 1000);
    }
    client.sendPacket(new PremiumInfo(premiumSecondsLeft));

    const countries: [string, string][] = [
      ["BR", "Brazil"],
      ["US", "United States"],
      ["RU", "Russia"],
    ];
    client.sendPacket(new LocalizationInfo(countries, "BR", true));

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

    const maskedEmail = user.email ? FormatUtils.maskEmail(user.email) : null;
    client.sendPacket(new EmailInfo(maskedEmail, user.emailConfirmed));
  }
}
