import { battleDataObject } from "@/config/BattleData";
import { BattleMode, EquipmentConstraintsMode } from "@/features/battle/battle.model";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { ResourceId } from "@/types/resourceTypes";
import logger from "@/utils/Logger";
import { ResourceManager } from "@/utils/ResourceManager";
import * as LobbyPackets from "./lobby.packets";
import { LobbyWorkflow } from "./lobby.workflow";

export class CreateBattleHandler implements IPacketHandler<LobbyPackets.CreateBattleRequest> {
    public readonly packetId = LobbyPackets.CreateBattleRequest.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: LobbyPackets.CreateBattleRequest): Promise<void> {
        if (!client.user) {
            return;
        }

        const battle = server.lobbyService.createBattle(packet, client.user);

        client.lastViewedBattleId = battle.battleId;

        const battleModeStr = BattleMode[packet.battleMode];
        const equipmentConstraintsModeStr = EquipmentConstraintsMode[packet.equipmentConstraintsMode];

        const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
        let preview = 0;
        if (mapInfo) {
            try {
                preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
            } catch (error) {
                logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
            }
        }

        const basePayload = {
            battleId: battle.battleId,
            battleMode: battleModeStr,
            map: battle.settings.mapId,
            maxPeople: battle.settings.maxPeopleCount,
            name: battle.settings.name,
            privateBattle: battle.settings.privateBattle,
            proBattle: battle.settings.proBattle,
            minRank: battle.settings.minRank,
            maxRank: battle.settings.maxRank,
            preview: preview,
            parkourMode: battle.settings.parkourMode,
            equipmentConstraintsMode: equipmentConstraintsModeStr,
            suspicionLevel: "NONE",
        };

        let finalPayload;

        if (battle.isTeamMode()) {
            finalPayload = {
                ...basePayload,
                usersBlue: [],
                usersRed: [],
            };
        } else {
            finalPayload = {
                ...basePayload,
                users: [],
            };
        }

        const responsePacket = new LobbyPackets.CreateBattleResponse(JSON.stringify(finalPayload));
        server.broadcastToBattleList(responsePacket);

        await LobbyWorkflow.sendBattleDetails(client, server, battle);
    }
}

export class SelectBattleHandler implements IPacketHandler<LobbyPackets.SelectBattlePacket> {
    public readonly packetId = LobbyPackets.SelectBattlePacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: LobbyPackets.SelectBattlePacket): Promise<void> {
        const requestedId = packet.battleId;
        let battle = requestedId ? server.lobbyService.getBattleById(requestedId) : undefined;

        if (!battle) {
            const allBattles = server.lobbyService.getBattles();
            if (allBattles.length === 0) {
                logger.error("No battles available to display details.");
                return;
            }
            battle = allBattles[0];
        }

        client.lastViewedBattleId = battle.battleId;
        await LobbyWorkflow.sendBattleDetails(client, server, battle);
    }
}

export class RequestBattleByLinkHandler implements IPacketHandler<LobbyPackets.RequestBattleByLinkPacket> {
    public readonly packetId = LobbyPackets.RequestBattleByLinkPacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: LobbyPackets.RequestBattleByLinkPacket): Promise<void> {
        if (!packet.battleId) {
            return;
        }

        const battle = server.lobbyService.getBattleById(packet.battleId);

        if (!battle) {
            logger.warn(`Client ${client.user?.username} requested details for non-existent battle ${packet.battleId}`);
            return;
        }

        client.lastViewedBattleId = battle.battleId;

        if (client.getState() === "chat_garage") {
            await LobbyWorkflow.returnToLobby(client, server, true);
        } else {
            await LobbyWorkflow.sendBattleDetails(client, server, battle);
        }
    }
}

export class ValidateBattleNameHandler implements IPacketHandler<LobbyPackets.ValidateBattleNameRequest> {
    public readonly packetId = LobbyPackets.ValidateBattleNameRequest.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: LobbyPackets.ValidateBattleNameRequest): Promise<void> {
        if (!packet.name) {
            return;
        }

        const sanitizedName = server.lobbyService.validateName(packet.name);
        client.sendPacket(new LobbyPackets.ValidateBattleNameResponse(sanitizedName));
    }
}

export class RequestLobbyHandler implements IPacketHandler<LobbyPackets.RequestLobbyPacket> {
    public readonly packetId = LobbyPackets.RequestLobbyPacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: LobbyPackets.RequestLobbyPacket): Promise<void> {
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