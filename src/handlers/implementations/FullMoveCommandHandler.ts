import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import FullMoveCommandPacket from "../../packets/implementations/FullMoveCommandPacket";

export default class FullMoveCommandHandler implements IPacketHandler<FullMoveCommandPacket> {
  public readonly packetId = FullMoveCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: FullMoveCommandPacket): void {
    // Lógica de dissipação de movimento pendente de implementação.
  }
}
