import StopShootingMachinegunCommandPacket from "../../packets/implementations/StopShootingMachinegunCommandPacket";
import StopShootingMachinegunPacket from "../../packets/implementations/StopShootingMachinegunPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class StopShootingMachinegunCommandHandler implements IPacketHandler<StopShootingMachinegunCommandPacket> {
    public readonly packetId = StopShootingMachinegunCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: StopShootingMachinegunCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("StopShootingMachinegunCommandHandler received packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const stopShootingPacket = new StopShootingMachinegunPacket(user.username);

        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(stopShootingPacket);
            }
        }
    }
}