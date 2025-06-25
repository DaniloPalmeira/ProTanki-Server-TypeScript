import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import DeclineFriendRequest from "../../packets/implementations/DeclineFriendRequest";
import FriendRequestDeclined from "../../packets/implementations/FriendRequestDeclined";
import SystemMessage from "../../packets/implementations/SystemMessage";
import FriendRequestCanceledOrDeclined from "../../packets/implementations/FriendRequestCanceledOrDeclined";

export default class DeclineFriendRequestHandler implements IPacketHandler<DeclineFriendRequest> {
  public readonly packetId = DeclineFriendRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: DeclineFriendRequest): Promise<void> {
    if (!client.user || !packet.nickname) {
      return;
    }

    try {
      const senderUser = await server.userService.declineFriendRequest(client.user, packet.nickname);
      client.sendPacket(new FriendRequestDeclined(senderUser.username));

      const senderClient = server.findClientByUsername(senderUser.username);
      if (senderClient) {
        senderClient.user = senderUser;
        senderClient.sendPacket(new FriendRequestCanceledOrDeclined(client.user.username));
      }
    } catch (error: any) {
      logger.error(`Failed to decline friend request for ${client.user.username} from ${packet.nickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
