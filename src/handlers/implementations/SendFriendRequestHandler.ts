import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import SendFriendRequest from "../../packets/implementations/SendFriendRequest";
import FriendRequestSent from "../../packets/implementations/FriendRequestSent";
import SystemMessage from "../../packets/implementations/SystemMessage";
import NewFriendRequest from "../../packets/implementations/NewFriendRequest";
import AlreadyFriends from "../../packets/implementations/AlreadyFriends";
import FriendRequestAlreadySent from "../../packets/implementations/FriendRequestAlreadySent";
import IncomingFriendRequestExists from "../../packets/implementations/IncomingFriendRequestExists";

export default class SendFriendRequestHandler implements IPacketHandler<SendFriendRequest> {
  public readonly packetId = SendFriendRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SendFriendRequest): Promise<void> {
    if (!client.user || !packet.nickname) {
      return;
    }

    try {
      const targetUser = await server.userService.sendFriendRequest(client.user, packet.nickname);
      client.sendPacket(new FriendRequestSent(targetUser.username));

      const targetClient = server.findClientByUsername(targetUser.username);
      if (targetClient) {
        targetClient.user = targetUser;
        targetClient.sendPacket(new NewFriendRequest(client.user.username));
      }
    } catch (error: any) {
      const targetUser = await server.userService.findUserByUsername(packet.nickname);
      const canonicalNickname = targetUser ? targetUser.username : packet.nickname;

      switch (error.message) {
        case "ALREADY_FRIENDS":
          client.sendPacket(new AlreadyFriends(canonicalNickname));
          break;
        case "REQUEST_ALREADY_SENT":
          client.sendPacket(new FriendRequestAlreadySent(canonicalNickname));
          break;
        case "INCOMING_REQUEST_EXISTS":
          client.sendPacket(new IncomingFriendRequestExists(canonicalNickname));
          break;
        default:
          logger.warn(`Failed to send friend request from ${client.user.username} to ${packet.nickname}`, {
            error: error.message,
            client: client.getRemoteAddress(),
          });
          client.sendPacket(new SystemMessage(error.message));
      }
    }
  }
}
