import StartShootingMachinegunCommandPacket from "../../packets/implementations/StartShootingMachinegunCommandPacket";
import StartShootingMachinegunPacket from "../../packets/implementations/StartShootingMachinegunPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class StartShootingMachinegunCommandHandler implements IPacketHandler<StartShootingMachinegunCommandPacket> {
    public readonly packetId = StartShootingMachinegunCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: StartShootingMachinegunCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("StartShootingMachinegunCommandHandler received packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const startShootingPacket = new StartShootingMachinegunPacket(user.username);

        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(startShootingPacket);
            }
        }
    }
}