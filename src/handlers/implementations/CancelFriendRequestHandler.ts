import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import CancelFriendRequest from "../../packets/implementations/CancelFriendRequest";
import FriendRequestCanceledOrDeclined from "../../packets/implementations/FriendRequestCanceledOrDeclined";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class CancelFriendRequestHandler implements IPacketHandler<CancelFriendRequest> {
  public readonly packetId = CancelFriendRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: CancelFriendRequest): Promise<void> {
    if (!client.user || !packet.nickname) {
      return;
    }

    try {
      const targetUser = await server.userService.cancelFriendRequest(client.user, packet.nickname);
      client.sendPacket(new FriendRequestCanceledOrDeclined(targetUser.username));

      const targetClient = server.findClientByUsername(targetUser.username);
      if (targetClient) {
        targetClient.user = targetUser;
        targetClient.sendPacket(new FriendRequestCanceledOrDeclined(client.user.username));
      }
    } catch (error: any) {
      logger.error(`Failed to cancel friend request from ${client.user.username} to ${packet.nickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
