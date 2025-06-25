import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import DeclineAllFriendRequests from "../../packets/implementations/DeclineAllFriendRequests";
import FriendRequestDeclined from "../../packets/implementations/FriendRequestDeclined";

export default class DeclineAllFriendRequestsHandler implements IPacketHandler<DeclineAllFriendRequests> {
  public readonly packetId = DeclineAllFriendRequests.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: DeclineAllFriendRequests): Promise<void> {
    if (!client.user) {
      logger.warn("DeclineAllFriendRequests received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    try {
      const declinedNicknames = await server.userService.declineAllFriendRequests(client.user);

      for (const nickname of declinedNicknames) {
        client.sendPacket(new FriendRequestDeclined(nickname));
      }
    } catch (error: any) {
      logger.error(`Failed to decline all friend requests for ${client.user.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
    }
  }
}
