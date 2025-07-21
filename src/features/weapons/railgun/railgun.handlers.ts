import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/ipacket-handler";
import logger from "@/utils/logger";
import * as RailgunPackets from "./railgun.packets";

export class RailgunShotCommandHandler implements IPacketHandler<RailgunPackets.RailgunShotCommandPacket> {
    public readonly packetId = RailgunPackets.RailgunShotCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: RailgunPackets.RailgunShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("RailgunShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const shotPacket = new RailgunPackets.RailgunShotPacket({
            shooterNickname: user.username,
            hitPosition: packet.position,
            targets: packet.targets.map((target) => ({
                nickname: target.nickname,
                position: target.position,
            })),
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
        logger.info(`User ${user.username} fired a railgun shot in battle ${currentBattle.battleId}`, { targets: packet.targets.map((t) => t.nickname) });
    }
}

export class StartChargingCommandHandler implements IPacketHandler<RailgunPackets.StartChargingCommandPacket> {
    public readonly packetId = RailgunPackets.StartChargingCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: RailgunPackets.StartChargingCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            return;
        }
        const startChargingPacket = new RailgunPackets.StartChargingPacket({
            nickname: user.username,
        });
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) {
                continue;
            }
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(startChargingPacket);
            }
        }
    }
}