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
    if (!client.user) {
      logger.warn("CancelFriendRequest received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const targetNickname = packet.nickname;
    if (!targetNickname) {
      return;
    }

    try {
      await server.userService.cancelFriendRequest(client.user, targetNickname);
      client.sendPacket(new FriendRequestCanceledOrDeclined(targetNickname));
    } catch (error: any) {
      logger.error(`Failed to cancel friend request from ${client.user.username} to ${targetNickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
