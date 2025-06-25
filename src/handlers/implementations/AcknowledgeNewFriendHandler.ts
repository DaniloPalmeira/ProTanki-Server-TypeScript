import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import AcknowledgeNewFriend from "../../packets/implementations/AcknowledgeNewFriend";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class AcknowledgeNewFriendHandler implements IPacketHandler<AcknowledgeNewFriend> {
  public readonly packetId = AcknowledgeNewFriend.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: AcknowledgeNewFriend): Promise<void> {
    if (!client.user) {
      logger.warn("AcknowledgeNewFriend received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const friendNickname = packet.nickname;
    if (!friendNickname) {
      return;
    }

    try {
      const friend = await server.userService.acknowledgeNewFriend(client.user, friendNickname);
      client.sendPacket(new AcknowledgeNewFriend(friend.username));
    } catch (error: any) {
      logger.error(`Failed to acknowledge new friend for ${client.user.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
