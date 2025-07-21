import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/ipacket-handler";
import logger from "@/utils/logger";
import * as RicochetPackets from "./ricochet.packets";

export class RicochetShotCommandHandler implements IPacketHandler<RicochetPackets.RicochetShotCommandPacket> {
    public readonly packetId = RicochetPackets.RicochetShotCommandPacket.getId();
    public execute(client: GameClient, server: GameServer, packet: RicochetPackets.RicochetShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("RicochetShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }
        const shotPacket = new RicochetPackets.RicochetShotPacket({
            nickname: user.username,
            x: packet.x,
            y: packet.y,
            z: packet.z,
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