import { BattleMode } from "../../models/Battle";
import ExitFromBattlePacket from "../../packets/implementations/ExitFromBattlePacket";
import RemoveTankPacket from "../../packets/implementations/RemoveTankPacket";
import UnloadSpaceBattlePacket from "../../packets/implementations/UnloadSpaceBattlePacket";
import UserDisconnectedDmPacket from "../../packets/implementations/UserDisconnectedDmPacket";
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
