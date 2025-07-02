import EnterBattlePacket from "../../packets/implementations/EnterBattlePacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";
import { BattleMode } from "../../models/Battle";
import ReservePlayerSlotDmPacket from "../../packets/implementations/ReservePlayerSlotDmPacket";
import AddUserToBattleDmPacket from "../../packets/implementations/AddUserToBattleDmPacket";

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

      if (battle.settings.battleMode === BattleMode.DM) {
        const reserveSlotPacket = new ReservePlayerSlotDmPacket(battle.battleId, client.user.username);
        server.broadcastToBattleList(reserveSlotPacket);

        const addUserPacket = new AddUserToBattleDmPacket({
          battleId: battle.battleId,
          nickname: client.user.username,
          kills: 0,
          score: 0,
          suspicious: false,
        });

        const battleDetailWatchers = server.getClients().filter((c) => (c.getState() === "chat_lobby" || c.getState() === "battle_lobby") && c.lastViewedBattleId === battle.battleId);

        for (const watcher of battleDetailWatchers) {
          watcher.sendPacket(addUserPacket);
        }
      }
    } catch (error: any) {
      logger.warn(`User ${client.user.username} failed to enter battle ${client.lastViewedBattleId}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
