import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import MoveCommandPacket from "../../packets/implementations/MoveCommandPacket";

export default class MoveCommandHandler implements IPacketHandler<MoveCommandPacket> {
  public readonly packetId = MoveCommandPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: MoveCommandPacket): void {
    // Lógica de dissipação de movimento pendente de implementação.
  }
}
