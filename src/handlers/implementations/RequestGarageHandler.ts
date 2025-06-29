import RequestGaragePacket from "../../packets/implementations/RequestGaragePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { GarageWorkflow } from "../../workflows/GarageWorkflow";
import { IPacketHandler } from "../IPacketHandler";

export default class RequestGarageHandler implements IPacketHandler<RequestGaragePacket> {
  public readonly packetId = RequestGaragePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestGaragePacket): Promise<void> {
    await GarageWorkflow.enterGarage(client, server);
  }
}
