import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import StopShootingFlamethrowerCommandPacket from "../../packets/implementations/StopShootingFlamethrowerCommandPacket";
import StopShootingFlamethrowerPacket from "../../packets/implementations/StopShootingFlamethrowerPacket";
import logger from "../../utils/Logger";

export default class StopShootingFlamethrowerCommandHandler implements IPacketHandler<StopShootingFlamethrowerCommandPacket> {
    public readonly packetId = StopShootingFlamethrowerCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: StopShootingFlamethrowerCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("StopShootingFlamethrowerCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const stopShootingPacket = new StopShootingFlamethrowerPacket(user.username);

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