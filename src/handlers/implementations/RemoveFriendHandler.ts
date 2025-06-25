import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import RemoveFriend from "../../packets/implementations/RemoveFriend";
import FriendRemoved from "../../packets/implementations/FriendRemoved";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class RemoveFriendHandler implements IPacketHandler<RemoveFriend> {
  public readonly packetId = RemoveFriend.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RemoveFriend): Promise<void> {
    const currentUser = client.user;
    if (!currentUser || !packet.nickname) {
      return;
    }

    try {
      const removedFriend = await server.userService.removeFriend(currentUser, packet.nickname);

      const updatedUser = await server.userService.findUserByUsername(currentUser.username);
      if (updatedUser) {
        client.user = updatedUser;
      }
      client.sendPacket(new FriendRemoved(removedFriend.username));

      const removedFriendClient = server.findClientByUsername(removedFriend.username);
      if (removedFriendClient) {
        removedFriendClient.user = removedFriend;
        removedFriendClient.sendPacket(new FriendRemoved(currentUser.username));
      }
    } catch (error: any) {
      logger.error(`Failed to remove friend for ${currentUser.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
