import ThunderShotNoTargetCommandPacket from "../../packets/implementations/ThunderShotNoTargetCommandPacket";
import ThunderShotNoTargetPacket from "../../packets/implementations/ThunderShotNoTargetPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class ThunderShotNoTargetCommandHandler implements IPacketHandler<ThunderShotNoTargetCommandPacket> {
    public readonly packetId = ThunderShotNoTargetCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: ThunderShotNoTargetCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("ThunderShotNoTargetCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const shotPacket = new ThunderShotNoTargetPacket(user.username);

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