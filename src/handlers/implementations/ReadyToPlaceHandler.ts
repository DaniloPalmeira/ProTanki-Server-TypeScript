import { IPacketHandler } from "../IPacketHandler";
import ReadyToPlacePacket from "../../packets/implementations/ReadyToPlacePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";

export default class ReadyToPlaceHandler implements IPacketHandler<ReadyToPlacePacket> {
  public readonly packetId = ReadyToPlacePacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ReadyToPlacePacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    logger.info(`Client ${client.user.username} is ready to be placed on the battlefield ${client.currentBattle.battleId}.`);

    // A próxima etapa será enviar os dados finais de spawn para todos os jogadores na batalha.
  }
}
