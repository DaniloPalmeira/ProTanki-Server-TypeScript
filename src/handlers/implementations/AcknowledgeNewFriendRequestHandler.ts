import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import AcknowledgeNewFriendRequest from "../../packets/implementations/AcknowledgeNewFriendRequest";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class AcknowledgeNewFriendRequestHandler implements IPacketHandler<AcknowledgeNewFriendRequest> {
  public readonly packetId = AcknowledgeNewFriendRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: AcknowledgeNewFriendRequest): Promise<void> {
    if (!client.user) {
      logger.warn("AcknowledgeNewFriendRequest received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const senderNickname = packet.nickname;
    if (!senderNickname) {
      return;
    }

    try {
      const sender = await server.userService.acknowledgeNewFriendRequest(client.user, senderNickname);
      client.sendPacket(new AcknowledgeNewFriendRequest(sender.username));
    } catch (error: any) {
      logger.error(`Failed to acknowledge new friend request for ${client.user.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
