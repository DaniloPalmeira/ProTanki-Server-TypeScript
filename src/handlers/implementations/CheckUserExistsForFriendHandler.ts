import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import CheckUserExistsForFriend from "../../packets/implementations/CheckUserExistsForFriend";
import UserExistsForFriend from "../../packets/implementations/UserExistsForFriend";
import UserInvalidForFriend from "../../packets/implementations/UserInvalidForFriend";

export default class CheckUserExistsForFriendHandler implements IPacketHandler<CheckUserExistsForFriend> {
  public readonly packetId = CheckUserExistsForFriend.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: CheckUserExistsForFriend): Promise<void> {
    if (!packet.nickname) {
      client.sendPacket(new UserInvalidForFriend());
      return;
    }

    const userExists = !(await server.userService.isUsernameAvailable(packet.nickname));

    if (userExists) {
      client.sendPacket(new UserExistsForFriend());
    } else {
      client.sendPacket(new UserInvalidForFriend());
    }
  }
}
