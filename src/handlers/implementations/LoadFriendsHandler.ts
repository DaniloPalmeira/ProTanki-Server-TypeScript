import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import LoadFriends from "../../packets/implementations/LoadFriends";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";

export default class LoadFriendsHandler implements IPacketHandler<LoadFriends> {
  public readonly packetId = LoadFriends.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: LoadFriends): Promise<void> {
    await LobbyWorkflow.sendFriendsList(client, server);
  }
}
