import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import StopShootingFreezeCommandPacket from "../../packets/implementations/StopShootingFreezeCommandPacket";
import StopShootingFreezePacket from "../../packets/implementations/StopShootingFreezePacket";
import logger from "../../utils/Logger";

export default class StopShootingFreezeCommandHandler implements IPacketHandler<StopShootingFreezeCommandPacket> {
    public readonly packetId = StopShootingFreezeCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: StopShootingFreezeCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("StopShootingFreezeCommandHandler received a packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const stopShootingPacket = new StopShootingFreezePacket(user.username);

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