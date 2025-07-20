import { GarageWorkflow } from "@/features/garage/garage.workflow";
import { LobbyWorkflow } from "@/features/lobby/lobby.workflow";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { CALLBACK } from "../../config/constants";
import ResourceCallback from "../../packets/implementations/ResourceCallback";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";

export default class ResourceCallbackHandler implements IPacketHandler<ResourceCallback> {
    public readonly packetId = ResourceCallback.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: ResourceCallback): Promise<void> {
        if (server.executeDynamicCallback(packet.callbackId, client)) {
            return;
        }

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
            case CALLBACK.BATTLE_MAP_GEOMETRY_LOADED:
                if (client.currentBattle) {
                    BattleWorkflow.loadGeneralBattleResources(client, server, client.currentBattle);
                }
                break;
            case CALLBACK.BATTLE_GENERAL_RESOURCES_LOADED:
                if (client.currentBattle) {
                    BattleWorkflow.loadPlayerEquipment(client, server, client.currentBattle);
                }
                break;
            case CALLBACK.BATTLE_PLAYER_EQUIPMENT_LOADED:
                if (client.currentBattle) {
                    BattleWorkflow.initializeBattle(client, server, client.currentBattle);
                }
                break;
            case CALLBACK.TIPS_LOADED:
                LoginWorkflow.sendMainLoginResources(client, server);
                break;
        }
    }
}