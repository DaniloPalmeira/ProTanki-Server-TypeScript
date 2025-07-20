import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import StartShootingFlamethrowerCommandPacket from "../../packets/implementations/StartShootingFlamethrowerCommandPacket";
import StartShootingFlamethrowerPacket from "../../packets/implementations/StartShootingFlamethrowerPacket";
import logger from "../../utils/Logger";

export default class StartShootingFlamethrowerCommandHandler implements IPacketHandler<StartShootingFlamethrowerCommandPacket> {
    public readonly packetId = StartShootingFlamethrowerCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: StartShootingFlamethrowerCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("StartShootingFlamethrowerCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const startShootingPacket = new StartShootingFlamethrowerPacket(user.username);

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