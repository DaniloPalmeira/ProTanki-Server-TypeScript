import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import * as FlamethrowerPackets from "./flamethrower.packets";
import logger from "@/utils/Logger";

export class StartShootingFlamethrowerCommandHandler implements IPacketHandler<FlamethrowerPackets.StartShootingFlamethrowerCommandPacket> {
    public readonly packetId = FlamethrowerPackets.StartShootingFlamethrowerCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: FlamethrowerPackets.StartShootingFlamethrowerCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("StartShootingFlamethrowerCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const startShootingPacket = new FlamethrowerPackets.StartShootingFlamethrowerPacket(user.username);
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

export class StopShootingFlamethrowerCommandHandler implements IPacketHandler<FlamethrowerPackets.StopShootingFlamethrowerCommandPacket> {
    public readonly packetId = FlamethrowerPackets.StopShootingFlamethrowerCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: FlamethrowerPackets.StopShootingFlamethrowerCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("StopShootingFlamethrowerCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const stopShootingPacket = new FlamethrowerPackets.StopShootingFlamethrowerPacket(user.username);
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