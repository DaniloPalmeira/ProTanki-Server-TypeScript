import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import ValidateBattleNameRequest from "../../packets/implementations/ValidateBattleNameRequest";
import ValidateBattleNameResponse from "../../packets/implementations/ValidateBattleNameResponse";

export default class ValidateBattleNameHandler implements IPacketHandler<ValidateBattleNameRequest> {
  public readonly packetId = ValidateBattleNameRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: ValidateBattleNameRequest): Promise<void> {
    if (!packet.name) {
      return;
    }

    const sanitizedName = server.battleService.validateName(packet.name);
    client.sendPacket(new ValidateBattleNameResponse(sanitizedName));
  }
}
