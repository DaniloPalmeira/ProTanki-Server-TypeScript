import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RecoveryAccountVerifyCode from "../../packets/implementations/RecoveryAccountVerifyCode";
import GoToRecoveryPassword from "../../packets/implementations/GoToRecoveryPassword";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";

export default class RecoveryAccountVerifyCodeHandler implements IPacketHandler<RecoveryAccountVerifyCode> {
  public readonly packetId = RecoveryAccountVerifyCode.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RecoveryAccountVerifyCode): void {
    if (client.recoveryCode && client.recoveryCode === packet.code) {
      client.sendPacket(new GoToRecoveryPassword(client.recoveryEmail));
    } else {
      LoginWorkflow.handleInvalidRecoveryCode(client);
    }
  }
}
