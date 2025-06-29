import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestBattleInfo from "../../packets/implementations/RequestBattleInfo";
import logger from "../../utils/Logger";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";

export default class RequestBattleInfoHandler implements IPacketHandler<RequestBattleInfo> {
  public readonly packetId = RequestBattleInfo.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestBattleInfo): Promise<void> {
    const requestedId = packet.battleId;
    let battle = requestedId ? server.battleService.getBattleById(requestedId) : undefined;

    if (!battle) {
      const allBattles = server.battleService.getBattles();
      if (allBattles.length === 0) {
        logger.error("No battles available to display details.");
        return;
      }
      battle = allBattles[0];
    }

    await LobbyWorkflow.sendBattleDetails(client, server, battle);
  }
}
