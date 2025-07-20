import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import TimeCheckerResponsePacket from "../../packets/implementations/TimeCheckerResponsePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";

export default class TimeCheckerResponseHandler implements IPacketHandler<TimeCheckerResponsePacket> {
  public readonly packetId = TimeCheckerResponsePacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: TimeCheckerResponsePacket): void {
    client.handleTimeCheckerResponse(packet.clientTime, packet.serverTime);
  }
}
