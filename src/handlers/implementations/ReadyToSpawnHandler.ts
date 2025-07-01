import { IPacketHandler } from "../IPacketHandler";
import ReadyToSpawnPacket from "../../packets/implementations/ReadyToSpawnPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";

export default class ReadyToSpawnHandler implements IPacketHandler<ReadyToSpawnPacket> {
    public readonly packetId = ReadyToSpawnPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: ReadyToSpawnPacket): void {
        if (!client.user || !client.currentBattle) {
            return;
        }

        logger.info(`Client ${client.user.username} is ready to spawn in battle ${client.currentBattle.battleId}.`);

        // A próxima etapa será encontrar um ponto de spawn e enviar as coordenadas para o cliente.
    }
}