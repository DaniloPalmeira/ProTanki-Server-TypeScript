import { BattleMode } from "../../models/Battle";
import ExitFromBattlePacket from "../../packets/implementations/ExitFromBattlePacket";
import ReleasePlayerSlotDmPacket from "../../packets/implementations/ReleasePlayerSlotDmPacket";
import RemoveTankPacket from "../../packets/implementations/RemoveTankPacket";
import RemoveUserFromBattleLobbyPacket from "../../packets/implementations/RemoveUserFromBattleLobbyPacket";
import UnloadSpaceBattlePacket from "../../packets/implementations/UnloadSpaceBattlePacket";
import UserDisconnectedDmPacket from "../../packets/implementations/UserDisconnectedDmPacket";
import UserNotInBattlePacket from "../../packets/implementations/UserNotInBattlePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { GarageWorkflow } from "../../workflows/GarageWorkflow";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { IPacketHandler } from "../IPacketHandler";

export default class ExitFromBattleHandler implements IPacketHandler<ExitFromBattlePacket> {
  public readonly packetId = ExitFromBattlePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: ExitFromBattlePacket): Promise<void> {
    const user = client.user;
    const battle = client.currentBattle;

    if (!user || !battle) {
      return;
    }

    const remainingPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed].filter((p) => p.id !== user.id);

    server.battleService.removeUserFromBattle(user, battle);

    const removeTankPacket = new RemoveTankPacket(user.username);
    for (const player of remainingPlayers) {
      const playerClient = server.findClientByUsername(player.username);
      if (playerClient) {
        playerClient.sendPacket(removeTankPacket);
      }
    }

    if (battle.settings.battleMode === BattleMode.DM) {
      const disconnectPacket = new UserDisconnectedDmPacket(user.username);
      for (const player of remainingPlayers) {
        const playerClient = server.findClientByUsername(player.username);
        if (playerClient) {
          playerClient.sendPacket(disconnectPacket);
        }
      }
    }

    const battleDetailWatchers = server.getClients().filter((c) => (c.getState() === "chat_lobby" || c.getState() === "battle_lobby") && c.lastViewedBattleId === battle.battleId);
    if (battleDetailWatchers.length > 0) {
      const removeUserPacket = new RemoveUserFromBattleLobbyPacket({ battleId: battle.battleId, nickname: user.username });
      for (const watcher of battleDetailWatchers) {
        watcher.sendPacket(removeUserPacket);
      }
    }

    if (battle.settings.battleMode === BattleMode.DM) {
      const releaseSlotPacket = new ReleasePlayerSlotDmPacket({ battleId: battle.battleId, nickname: user.username });
      server.broadcastToBattleList(releaseSlotPacket);
    }

    if (client.friendsCache.length > 0) {
      const userNotInBattlePacket = new UserNotInBattlePacket(user.username);
      for (const friendUsername of client.friendsCache) {
        const friendClient = server.findClientByUsername(friendUsername);
        if (friendClient) {
          friendClient.sendPacket(userNotInBattlePacket);
        }
      }
    }

    client.sendPacket(new UnloadSpaceBattlePacket());

    client.currentBattle = null;
    client.battleState = "suicide";
    client.stopTimeChecker();

    if (packet.layout === 0) {
      LobbyWorkflow.returnToLobby(client, server);
    } else if (packet.layout === 1) {
      GarageWorkflow.enterGarage(client, server);
    }
  }
}
