import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import Pong from "../../packets/implementations/Pong";
import Ping from "../../packets/implementations/Ping";

export default class PongHandler implements IPacketHandler<Pong> {
  public readonly packetId = Pong.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: Pong): void {
    setTimeout(() => {
      client.sendPacket(new Ping());
    }, 10000);
  }
}
