import RequestLobbyPacket from "../../packets/implementations/RequestLobbyPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { IPacketHandler } from "../IPacketHandler";

export default class RequestLobbyHandler implements IPacketHandler<RequestLobbyPacket> {
  public readonly packetId = RequestLobbyPacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestLobbyPacket): Promise<void> {
    LobbyWorkflow.returnToLobby(client, server);
  }
}
