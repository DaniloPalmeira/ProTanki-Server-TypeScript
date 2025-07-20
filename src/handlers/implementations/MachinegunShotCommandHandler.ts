import MachinegunShotCommandPacket from "../../packets/implementations/MachinegunShotCommandPacket";
import MachinegunShotPacket from "../../packets/implementations/MachinegunShotPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class MachinegunShotCommandHandler implements IPacketHandler<MachinegunShotCommandPacket> {
    public readonly packetId = MachinegunShotCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: MachinegunShotCommandPacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn("MachinegunShotCommandHandler received packet from a client not in a battle.", { client: client.getRemoteAddress() });
            return;
        }

        const shotPacket = new MachinegunShotPacket({
            nickname: user.username,
            shotDirection: packet.shotDirection,
            targets: packet.targets.map(targetCmd => ({
                nickname: targetCmd.nickname,
                localHitPoint: targetCmd.localHitPoint,
                direction: packet.shotDirection,
                numberHits: 1,
            }))
        });

        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(shotPacket);
            }
        }
    }
}