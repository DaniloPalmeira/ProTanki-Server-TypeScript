import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import InviteCode from "../../packets/implementations/InviteCode";
import InviteCodeInvalid from "../../packets/implementations/InviteCodeInvalid";
import InviteCodeLogin from "../../packets/implementations/InviteCodeLogin";
import InviteCodeRegister from "../../packets/implementations/InviteCodeRegister";

export default class InviteCodeHandler implements IPacketHandler<InviteCode> {
  public readonly packetId = InviteCode.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: InviteCode): Promise<void> {
    const result = await server.validateInviteCode(packet.inviteCode);

    if (!result.isValid) {
      client.sendPacket(new InviteCodeInvalid());
      return;
    }

    if (result.nickname) {
      client.sendPacket(new InviteCodeLogin(result.nickname));
      return;
    }

    client.sendPacket(new InviteCodeRegister());
  }
}
