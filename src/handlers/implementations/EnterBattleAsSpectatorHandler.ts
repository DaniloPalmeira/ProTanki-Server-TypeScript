import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import EnterBattleAsSpectatorPacket from "../../packets/implementations/EnterBattleAsSpectatorPacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import logger from "../../utils/Logger";

export default class EnterBattleAsSpectatorHandler implements IPacketHandler<EnterBattleAsSpectatorPacket> {
  public readonly packetId = EnterBattleAsSpectatorPacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: EnterBattleAsSpectatorPacket): Promise<void> {
    if (!client.user || !client.lastViewedBattleId) {
      client.sendPacket(new SystemMessage("Nenhuma batalha selecionada."));
      return;
    }

    try {
      const battle = server.battleService.addSpectatorToBattle(client.user, client.lastViewedBattleId);
      client.currentBattle = battle;
      client.isSpectator = true;

      server.battleService.broadcastSpectatorListUpdate(battle, client);

      await BattleWorkflow.enterBattle(client, server, battle);
    } catch (error: any) {
      logger.warn(`User ${client.user.username} failed to enter battle ${client.lastViewedBattleId} as spectator`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
