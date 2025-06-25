import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import DeclineAllFriendRequests from "../../packets/implementations/DeclineAllFriendRequests";
import FriendRequestDeclined from "../../packets/implementations/FriendRequestDeclined";
import FriendRequestCanceledOrDeclined from "../../packets/implementations/FriendRequestCanceledOrDeclined";

export default class DeclineAllFriendRequestsHandler implements IPacketHandler<DeclineAllFriendRequests> {
  public readonly packetId = DeclineAllFriendRequests.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: DeclineAllFriendRequests): Promise<void> {
    if (!client.user) {
      logger.warn("DeclineAllFriendRequests received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    try {
      const declinedSenders = await server.userService.declineAllFriendRequests(client.user);

      for (const sender of declinedSenders) {
        client.sendPacket(new FriendRequestDeclined(sender.username));

        const senderClient = server.findClientByUsername(sender.username);
        if (senderClient) {
          senderClient.sendPacket(new FriendRequestCanceledOrDeclined(client.user.username));
        }
      }
    } catch (error: any) {
      logger.error(`Failed to decline all friend requests for ${client.user.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
    }
  }
}
