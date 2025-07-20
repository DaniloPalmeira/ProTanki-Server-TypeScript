import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import SelectBattlePacket from "../../packets/implementations/SelectBattlePacket";
import logger from "../../utils/Logger";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";

export default class SelectBattleHandler implements IPacketHandler<SelectBattlePacket> {
  public readonly packetId = SelectBattlePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SelectBattlePacket): Promise<void> {
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

    client.lastViewedBattleId = battle.battleId;
    await LobbyWorkflow.sendBattleDetails(client, server, battle);
  }
}
