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
    const currentUser = client.user;
    if (!currentUser || !packet.nickname) {
      logger.warn("AcceptFriendRequest received from unauthenticated or incomplete client.", { client: client.getRemoteAddress() });
      return;
    }

    try {
      const senderUser = await server.userService.acceptFriendRequest(currentUser, packet.nickname);

      const updatedUser = await server.userService.findUserByUsername(currentUser.username);
      if (updatedUser) {
        client.user = updatedUser;
      }
      client.sendPacket(new FriendRequestAccepted(senderUser.username));

      const senderClient = server.findClientByUsername(senderUser.username);
      if (senderClient) {
        senderClient.user = senderUser;
        senderClient.sendPacket(new FriendRequestAccepted(currentUser.username));

        if (!senderClient.friendsCache.includes(currentUser.username)) {
          senderClient.friendsCache.push(currentUser.username);
        }
      }

      if (!client.friendsCache.includes(senderUser.username)) {
        client.friendsCache.push(senderUser.username);
      }
    } catch (error: any) {
      logger.error(`Failed to accept friend request for ${currentUser.username} from ${packet.nickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
