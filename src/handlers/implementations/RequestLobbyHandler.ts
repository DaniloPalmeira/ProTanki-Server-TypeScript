import { LobbyWorkflow } from "@/features/lobby/lobby.workflow";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import RequestLobbyPacket from "../../packets/implementations/RequestLobbyPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";

export default class RequestLobbyHandler implements IPacketHandler<RequestLobbyPacket> {
  public readonly packetId = RequestLobbyPacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestLobbyPacket): Promise<void> {
    const state = client.getState();

    if (client.currentBattle) {
      if (state === "battle") {
        LobbyWorkflow.enterBattleLobbyView(client, server);
      } else if (state === "battle_lobby") {
        LobbyWorkflow.returnToBattleView(client, server);
      } else if (state === "battle_garage") {
        LobbyWorkflow.transitionFromGarageToLobby(client, server);
      }
    } else {
      if (state === "chat_garage") {
        await LobbyWorkflow.returnToLobby(client, server, true);
      }
    }
  }
}