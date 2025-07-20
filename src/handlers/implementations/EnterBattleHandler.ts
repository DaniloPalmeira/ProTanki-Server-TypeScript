import EnterBattlePacket from "../../packets/implementations/EnterBattlePacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { BattleMode } from "../../models/Battle";
import ReservePlayerSlotDmPacket from "../../packets/implementations/ReservePlayerSlotDmPacket";
import AddUserToBattleDmPacket from "../../packets/implementations/AddUserToBattleDmPacket";
import NotifyFriendOfBattlePacket from "../../packets/implementations/NotifyFriendOfBattlePacket";
import { battleDataObject } from "../../config/BattleData";

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

      const joiningUser = client.user;
      if (client.friendsCache.length > 0) {
        const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
        const mapName = mapInfo ? mapInfo.mapName : battle.settings.mapId;

        const notifyFriendsPacket = new NotifyFriendOfBattlePacket({
          battleId: battle.battleId,
          mapName: mapName,
          mode: battle.settings.battleMode,
          privateBattle: battle.settings.privateBattle,
          probattle: battle.settings.proBattle,
          maxRank: battle.settings.maxRank,
          minRank: battle.settings.minRank,
          serverNumber: 1,
          nickname: joiningUser.username,
        });

        for (const friendUsername of client.friendsCache) {
          const friendClient = server.findClientByUsername(friendUsername);
          if (friendClient) {
            friendClient.sendPacket(notifyFriendsPacket);
          }
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
