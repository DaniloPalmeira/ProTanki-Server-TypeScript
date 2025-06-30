import EnterBattlePacket from "../../packets/implementations/EnterBattlePacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";

export default class EnterBattleHandler implements IPacketHandler<EnterBattlePacket> {
  public readonly packetId = EnterBattlePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: EnterBattlePacket): Promise<void> {
    if (!client.user || !client.lastViewedBattleId) {
      client.sendPacket(new SystemMessage("Nenhuma batalha selecionada."));
      return;
    }

    try {
      const battle = server.battleService.addUserToBattle(client.user, client.lastViewedBattleId, packet.battleTeam);
      client.currentBattle = battle;

      await BattleWorkflow.enterBattle(client, server, battle);

      server.getClients().forEach((c) => {
        if (c.lastViewedBattleId === battle.battleId) {
          LobbyWorkflow.sendBattleDetails(c, server, battle);
        }
      });
    } catch (error: any) {
      logger.warn(`User ${client.user.username} failed to enter battle ${client.lastViewedBattleId}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
