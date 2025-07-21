import { CALLBACK } from "@/config/constants";
import { BattleWorkflow } from "@/features/battle/battle.workflow";
import { GarageWorkflow } from "@/features/garage/garage.workflow";
import { LobbyWorkflow } from "@/features/lobby/lobby.workflow";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { ResourceId } from "@/types/resourceTypes";
import { ResourceManager } from "@/utils/ResourceManager";
import { LoginWorkflow } from "@/workflows/LoginWorkflow";
import * as LoaderPackets from "./loader.packets";

export class RequestNextTipHandler implements IPacketHandler<LoaderPackets.RequestNextTipPacket> {
    public readonly packetId = LoaderPackets.RequestNextTipPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: LoaderPackets.RequestNextTipPacket): void {
        const tipResources: ResourceId[] = ["tips/tip_1", "tips/tip_2", "tips/tip_3"];
        const randomTipId = tipResources[Math.floor(Math.random() * tipResources.length)];

        try {
            const resourceIdLow = ResourceManager.getIdlowById(randomTipId);
            client.sendPacket(new LoaderPackets.SetLoadingScreenImagePacket(resourceIdLow));
        } catch (error) {
            client.sendPacket(new LoaderPackets.SetLoadingScreenImagePacket(ResourceManager.getIdlowById("ui/login_background")));
        }
    }
}

export class ResourceCallbackHandler implements IPacketHandler<LoaderPackets.ResourceCallback> {
    public readonly packetId = LoaderPackets.ResourceCallback.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: LoaderPackets.ResourceCallback): Promise<void> {
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