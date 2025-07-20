import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { GarageWorkflow } from "../../workflows/GarageWorkflow";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import ExitFromBattlePacket from "../../packets/implementations/ExitFromBattlePacket";
import UnloadSpaceBattlePacket from "../../packets/implementations/UnloadSpaceBattlePacket";
import UnloadBattleListPacket from "../../packets/implementations/UnloadBattleListPacket";

export default class ExitFromBattleHandler implements IPacketHandler<ExitFromBattlePacket> {
  public readonly packetId = ExitFromBattlePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: ExitFromBattlePacket): Promise<void> {
    const user = client.user;
    const battle = client.currentBattle;
    const isSpectator = client.isSpectator;

    if (!user || !battle) {
      return;
    }

    if (!isSpectator) {
      server.battleService.announceTankRemoval(user, battle);
    }
    await server.battleService.finalizeBattleExit(user, battle, client.friendsCache, isSpectator);

    client.sendPacket(new UnloadSpaceBattlePacket());

    client.currentBattle = null;
    client.isSpectator = false;
    client.battleState = "suicide";
    client.stopTimeChecker();

    if (packet.layout === 0) {
      if (client.getState() === "battle_lobby") {
        client.sendPacket(new UnloadBattleListPacket());
      }
      LobbyWorkflow.returnToLobby(client, server, false);
    } else if (packet.layout === 1) {
      GarageWorkflow.enterGarage(client, server);
    }
  }
}
