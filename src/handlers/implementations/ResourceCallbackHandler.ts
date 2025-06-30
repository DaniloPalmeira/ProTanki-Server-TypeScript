import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import ResourceCallback from "../../packets/implementations/ResourceCallback";
import { CALLBACK } from "../../config/constants";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";
import { GarageWorkflow } from "../../workflows/GarageWorkflow";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";

export default class ResourceCallbackHandler implements IPacketHandler<ResourceCallback> {
  public readonly packetId = ResourceCallback.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: ResourceCallback): Promise<void> {
    switch (packet.callbackId) {
      case CALLBACK.LOGIN_FORM:
        LoginWorkflow.initializeLoginForm(client, server);
        break;
      case CALLBACK.GARAGE_DATA:
        GarageWorkflow.initializeGarage(client, server);
        break;
      case CALLBACK.LOBBY_DATA:
        await LobbyWorkflow.initializeLobby(client, server);
        break;
      case CALLBACK.BATTLE_MAP_LIBS_LOADED:
        if (client.currentBattle) {
          BattleWorkflow.loadMapResources(client, server, client.currentBattle);
        }
        break;
      case CALLBACK.BATTLE_SKYBOX_LOADED:
        if (client.currentBattle) {
          BattleWorkflow.loadMapGeometry(client, server, client.currentBattle);
        }
        break;
    }
  }
}
