import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import CheckNicknameAvailable from "../../packets/implementations/CheckNicknameAvailable";
import { ValidationUtils } from "../../utils/ValidationUtils";
import InvalidNickname from "../../packets/implementations/InvalidNickname";
import NicknameAvailable from "../../packets/implementations/NicknameAvailable";
import NicknameUnavailable from "../../packets/implementations/NicknameUnavailable";

export default class CheckNicknameAvailableHandler implements IPacketHandler<CheckNicknameAvailable> {
  public readonly packetId = CheckNicknameAvailable.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: CheckNicknameAvailable): Promise<void> {
    if (!packet.nickname || packet.nickname.length < 3) {
      return;
    }

    if (ValidationUtils.isNicknameInappropriate(packet.nickname)) {
      client.sendPacket(new InvalidNickname());
      return;
    }

    const isAvailable = await server.userService.isUsernameAvailable(packet.nickname);
    if (isAvailable) {
      client.sendPacket(new NicknameAvailable());
    } else {
      const suggestions = await server.userService.generateUsernameSuggestions(packet.nickname);
      client.sendPacket(new NicknameUnavailable(suggestions));
    }
  }
}
