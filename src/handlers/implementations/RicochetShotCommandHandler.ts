import RicochetShotCommandPacket from "../../packets/implementations/RicochetShotCommandPacket";
import RicochetShotPacket from "../../packets/implementations/RicochetShotPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class RicochetShotCommandHandler implements IPacketHandler<RicochetShotCommandPacket> {
    public readonly packetId = RicochetShotCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: RicochetShotCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("RicochetShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const shotPacket = new RicochetShotPacket({
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