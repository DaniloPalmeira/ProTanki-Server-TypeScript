import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RotateTurretCommandPacket from "../../packets/implementations/RotateTurretCommandPacket";

export default class RotateTurretCommandHandler implements IPacketHandler<RotateTurretCommandPacket> {
  public readonly packetId = RotateTurretCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RotateTurretCommandPacket): void {
    // Lógica de dissipação de movimento da torreta pendente de implementação.
  }
}
