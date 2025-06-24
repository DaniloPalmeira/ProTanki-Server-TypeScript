import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import SendFriendRequest from "../../packets/implementations/SendFriendRequest";
import FriendRequestSent from "../../packets/implementations/FriendRequestSent";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class SendFriendRequestHandler implements IPacketHandler<SendFriendRequest> {
  public readonly packetId = SendFriendRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SendFriendRequest): Promise<void> {
    if (!client.user) {
      logger.warn("SendFriendRequest received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    if (!packet.nickname) {
      client.sendPacket(new SystemMessage("Apelido do alvo inválido."));
      return;
    }

    try {
      await server.userService.sendFriendRequest(client.user, packet.nickname);
      client.sendPacket(new FriendRequestSent(packet.nickname));
    } catch (error: any) {
      logger.warn(`Failed to send friend request from ${client.user.username} to ${packet.nickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
