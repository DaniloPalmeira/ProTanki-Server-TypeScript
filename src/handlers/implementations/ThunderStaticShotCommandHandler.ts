import ThunderStaticShotCommandPacket from "../../packets/implementations/ThunderStaticShotCommandPacket";
import ThunderStaticShotPacket from "../../packets/implementations/ThunderStaticShotPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";

export default class ThunderStaticShotCommandHandler implements IPacketHandler<ThunderStaticShotCommandPacket> {
    public readonly packetId = ThunderStaticShotCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: ThunderStaticShotCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("ThunderStaticShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const shotPacket = new ThunderStaticShotPacket({
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