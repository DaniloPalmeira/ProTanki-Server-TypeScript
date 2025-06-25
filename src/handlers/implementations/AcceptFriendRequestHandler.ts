import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import AcceptFriendRequest from "../../packets/implementations/AcceptFriendRequest";
import FriendRequestAccepted from "../../packets/implementations/FriendRequestAccepted";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class AcceptFriendRequestHandler implements IPacketHandler<AcceptFriendRequest> {
  public readonly packetId = AcceptFriendRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: AcceptFriendRequest): Promise<void> {
    if (!client.user) {
      logger.warn("AcceptFriendRequest received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const senderNickname = packet.nickname;
    if (!senderNickname) {
      return;
    }

    try {
      const senderUser = await server.userService.acceptFriendRequest(client.user, senderNickname);

      client.sendPacket(new FriendRequestAccepted(senderUser.username));

      const senderClient = server.findClientByUsername(senderUser.username);
      if (senderClient) {
        senderClient.sendPacket(new FriendRequestAccepted(client.user.username));
      }
    } catch (error: any) {
      logger.error(`Failed to accept friend request for ${client.user.username} from ${senderNickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
