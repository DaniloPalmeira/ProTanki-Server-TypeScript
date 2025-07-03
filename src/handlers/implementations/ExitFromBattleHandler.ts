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

    server.battleService.announceTankRemoval(user, battle);
    await server.battleService.finalizeBattleExit(user, battle, client.friendsCache);

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
