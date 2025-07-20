import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import * as ThunderPackets from "./thunder.packets";
import logger from "@/utils/Logger";

export class ThunderShotNoTargetCommandHandler implements IPacketHandler<ThunderPackets.ThunderShotNoTargetCommandPacket> {
    public readonly packetId = ThunderPackets.ThunderShotNoTargetCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: ThunderPackets.ThunderShotNoTargetCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("ThunderShotNoTargetCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const shotPacket = new ThunderPackets.ThunderShotNoTargetPacket(user.username);
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) {
                continue;
            }
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(shotPacket);
            }
        }
    }
}

export class ThunderStaticShotCommandHandler implements IPacketHandler<ThunderPackets.ThunderStaticShotCommandPacket> {
    public readonly packetId = ThunderPackets.ThunderStaticShotCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: ThunderPackets.ThunderStaticShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("ThunderStaticShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const shotPacket = new ThunderPackets.ThunderStaticShotPacket({
            nickname: user.username,
            position: packet.position,
        });
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) {
                continue;
            }
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(shotPacket);
            }
        }
    }
}

export class ThunderTargetShotCommandHandler implements IPacketHandler<ThunderPackets.ThunderTargetShotCommandPacket> {
    public readonly packetId = ThunderPackets.ThunderTargetShotCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: ThunderPackets.ThunderTargetShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("ThunderTargetShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const shotPacket = new ThunderPackets.ThunderTargetShotPacket({
            nicknameShooter: user.username,
            nicknameTarget: packet.nicknameTarget,
            internalPosition: packet.internalPosition,
        });
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) {
                continue;
            }
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(shotPacket);
            }
        }
        logger.info(`Thunder shot from ${user.username} to ${packet.nicknameTarget}.`);
    }
}