import ThunderTargetShotCommandPacket from "../../packets/implementations/ThunderTargetShotCommandPacket";
import ThunderTargetShotPacket from "../../packets/implementations/ThunderTargetShotPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";

export default class ThunderTargetShotCommandHandler implements IPacketHandler<ThunderTargetShotCommandPacket> {
    public readonly packetId = ThunderTargetShotCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: ThunderTargetShotCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("ThunderTargetShotCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const shotPacket = new ThunderTargetShotPacket({
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