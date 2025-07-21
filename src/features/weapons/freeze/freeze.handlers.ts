import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "@/utils/logger";
import * as FreezePackets from "./freeze.packets";

export class StartShootingFreezeCommandHandler implements IPacketHandler<FreezePackets.StartShootingFreezeCommandPacket> {
    public readonly packetId = FreezePackets.StartShootingFreezeCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: FreezePackets.StartShootingFreezeCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("StartShootingFreezeCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const startShootingPacket = new FreezePackets.StartShootingFreezePacket(user.username);
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) {
                continue;
            }
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(startShootingPacket);
            }
        }
    }
}

export class StopShootingFreezeCommandHandler implements IPacketHandler<FreezePackets.StopShootingFreezeCommandPacket> {
    public readonly packetId = FreezePackets.StopShootingFreezeCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: FreezePackets.StopShootingFreezeCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("StopShootingFreezeCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const stopShootingPacket = new FreezePackets.StopShootingFreezePacket(user.username);
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) {
                continue;
            }
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(stopShootingPacket);
            }
        }
    }
}