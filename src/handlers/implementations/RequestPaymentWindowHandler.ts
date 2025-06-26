import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestPaymentWindow from "../../packets/implementations/RequestPaymentWindow";
import ShowPaymentWindow from "../../packets/implementations/ShowPaymentWindow";

export default class RequestPaymentWindowHandler implements IPacketHandler<RequestPaymentWindow> {
  public readonly packetId = RequestPaymentWindow.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RequestPaymentWindow): void {
    client.sendPacket(new ShowPaymentWindow());
  }
}
