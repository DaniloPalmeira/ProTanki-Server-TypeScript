import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "@/utils/logger";
import * as ReferralPackets from "./referral.packets";

export class RequestReferralInfoHandler implements IPacketHandler<ReferralPackets.RequestReferralInfo> {
    public readonly packetId = ReferralPackets.RequestReferralInfo.getId();

    public async execute(client: GameClient, server: GameServer): Promise<void> {
        if (!client.user) {
            logger.warn("RequestReferralInfo received from unauthenticated client.", { client: client.getRemoteAddress() });
            return;
        }

        const details = await server.referralService.getReferralDetails(client.user);

        client.sendPacket(
            new ReferralPackets.ReferralInfoDetails({
                referredUsers: details.referredUsers,
                url: details.url,
                bannerCode: details.bannerCodeString,
                defaultMessage: details.defaultRefMessage,
            })
        );
    }
}