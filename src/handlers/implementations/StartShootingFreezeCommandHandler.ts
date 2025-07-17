import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import StartShootingFreezeCommandPacket from "../../packets/implementations/StartShootingFreezeCommandPacket";
import StartShootingFreezePacket from "../../packets/implementations/StartShootingFreezePacket";
import logger from "../../utils/Logger";

export default class StartShootingFreezeCommandHandler implements IPacketHandler<StartShootingFreezeCommandPacket> {
    public readonly packetId = StartShootingFreezeCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: StartShootingFreezeCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("StartShootingFreezeCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const startShootingPacket = new StartShootingFreezePacket(user.username);
        
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