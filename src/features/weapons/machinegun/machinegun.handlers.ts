import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/ipacket-handler";
import logger from "@/utils/logger";
import * as MachinegunPackets from "./machinegun.packets";

export class StartShootingMachinegunCommandHandler implements IPacketHandler<MachinegunPackets.StartShootingMachinegunCommandPacket> {
    public readonly packetId = MachinegunPackets.StartShootingMachinegunCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: MachinegunPackets.StartShootingMachinegunCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("StartShootingMachinegunCommandHandler received packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const startShootingPacket = new MachinegunPackets.StartShootingMachinegunPacket(user.username);
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(startShootingPacket);
            }
        }
    }
}

export class MachinegunShotCommandHandler implements IPacketHandler<MachinegunPackets.MachinegunShotCommandPacket> {
    public readonly packetId = MachinegunPackets.MachinegunShotCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: MachinegunPackets.MachinegunShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("MachinegunShotCommandHandler received packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const shotPacket = new MachinegunPackets.MachinegunShotPacket({
            nickname: user.username,
            shotDirection: packet.shotDirection,
            targets: packet.targets.map((targetCmd) => ({
                nickname: targetCmd.nickname,
                localHitPoint: targetCmd.localHitPoint,
                direction: packet.shotDirection,
                numberHits: 1,
            })),
        });
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(shotPacket);
            }
        }
    }
}

export class StopShootingMachinegunCommandHandler implements IPacketHandler<MachinegunPackets.StopShootingMachinegunCommandPacket> {
    public readonly packetId = MachinegunPackets.StopShootingMachinegunCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: MachinegunPackets.StopShootingMachinegunCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("StopShootingMachinegunCommandHandler received packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const stopShootingPacket = new MachinegunPackets.StopShootingMachinegunPacket(user.username);
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(stopShootingPacket);
            }
        }
    }
}