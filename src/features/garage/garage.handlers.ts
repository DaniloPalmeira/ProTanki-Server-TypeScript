import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import SystemMessage from "../../packets/implementations/SystemMessage";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../../shared/interfaces/IPacketHandler";
import { GarageWorkflow } from "./garage.workflow";
import * as GaragePackets from "./garage.packets";

export class RequestGarageHandler implements IPacketHandler<GaragePackets.RequestGaragePacket> {
    public readonly packetId = GaragePackets.RequestGaragePacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: GaragePackets.RequestGaragePacket): Promise<void> {
        const state = client.getState();

        if (client.currentBattle) {
            if (state === "battle") {
                GarageWorkflow.enterBattleGarageView(client, server);
            } else if (state === "battle_garage") {
                GarageWorkflow.returnToBattleView(client, server);
            } else if (state === "battle_lobby") {
                GarageWorkflow.transitionFromLobbyToGarage(client, server);
            }
        } else {
            if (state === "chat_lobby") {
                await GarageWorkflow.enterGarage(client, server);
            }
        }
    }
}

export class BuyItemHandler implements IPacketHandler<GaragePackets.BuyItemPacket> {
    public readonly packetId = GaragePackets.BuyItemPacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: GaragePackets.BuyItemPacket): Promise<void> {
        if (!client.user || !packet.itemId) {
            return;
        }

        try {
            await server.garageService.purchaseItem(client.user, packet.itemId, packet.quantity, packet.price);
        } catch (error: any) {
            logger.warn(`Failed to purchase item ${packet.itemId} for user ${client.user.username}`, {
                error: error.message,
                client: client.getRemoteAddress(),
            });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class EquipItemRequestHandler implements IPacketHandler<GaragePackets.EquipItemRequestPacket> {
    public readonly packetId = GaragePackets.EquipItemRequestPacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: GaragePackets.EquipItemRequestPacket): Promise<void> {
        if (!client.user || !packet.itemId) {
            return;
        }

        try {
            await server.garageService.equipItem(client.user, packet.itemId);
            if (client.currentBattle) {
                client.equipmentChangedInGarage = true;
            }
            client.sendPacket(new GaragePackets.MountItemPacket(packet.itemId, true));
        } catch (error: any) {
            logger.warn(`Failed to equip item ${packet.itemId} for user ${client.user.username}`, {
                error: error.message,
                client: client.getRemoteAddress(),
            });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}