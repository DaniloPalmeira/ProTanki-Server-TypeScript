import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "../../utils/Logger";
import RequestReferralInfo from "../../packets/implementations/RequestReferralInfo";
import User from "../../models/User";
import { IReferredUser } from "../../packets/interfaces/IReferralInfoDetails";
import ReferralInfoDetails from "../../packets/implementations/ReferralInfoDetails";

export default class RequestReferralInfoHandler implements IPacketHandler<RequestReferralInfo> {
  public readonly packetId = RequestReferralInfo.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    if (!client.user) {
      logger.warn("RequestReferralInfo received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const user = client.user;
    const referredUsersList: IReferredUser[] = [];

    try {
      const referred = await User.find({ referredBy: user._id });
      for (const ref of referred) {
        // A lógica de 'income' precisa ser implementada futuramente.
        referredUsersList.push({ user: ref.username, income: 0 });
      }
    } catch (error) {
      logger.error(`Failed to fetch referred users for ${user.username}`, { error });
    }

    const referralUrl = `https://start.protanki-game.com/?refId=${user.referralHash}`;
    const bannerCode = `<iframe src="http://s.pro-tanki.com/refbanner/index.html?hash=${user.referralHash}" width="953" height="255" style="border:none;"></iframe>`;
    const defaultMessage = "";

    client.sendPacket(new ReferralInfoDetails(referredUsersList, referralUrl, bannerCode, defaultMessage));
  }
}
