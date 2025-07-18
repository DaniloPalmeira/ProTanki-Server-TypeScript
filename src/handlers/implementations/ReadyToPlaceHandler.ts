import { IPacketHandler } from "../IPacketHandler";
import ReadyToPlacePacket from "../../packets/implementations/ReadyToPlacePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import SetHealthPacket from "../../packets/implementations/SetHealthPacket";
import SpawnPacket from "../../packets/implementations/SpawnPacket";
import { ItemUtils } from "../../utils/ItemUtils";
import { BattleWorkflow } from "../../workflows/BattleWorkflow";
import TankModelDataPacket from "../../packets/implementations/TankModelDataPacket";
import EquipmentChangedPacket from "../../packets/implementations/EquipmentChangedPacket";
import RemoveTankPacket from "../../packets/implementations/RemoveTankPacket";

export default class ReadyToPlaceHandler implements IPacketHandler<ReadyToPlacePacket> {
  public readonly packetId = ReadyToPlacePacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ReadyToPlacePacket): void {
    if (!client.user || !client.currentBattle || client.isSpectator) {
      return;
    }

    logger.info(`Placing user ${client.user.username} on the battlefield ${client.currentBattle.battleId}.`);

    try {
      const battle = client.currentBattle;
      const user = client.user;

      const broadcastToBattle = (packetToBroadcast: any) => {
        const allParticipants = battle.getAllParticipants();
        allParticipants.forEach((participant) => {
          const participantClient = server.findClientByUsername(participant.username);
          if (participantClient && participantClient.currentBattle?.battleId === battle.battleId) {
            participantClient.sendPacket(packetToBroadcast);
          }
        });
      };

      if (client.pendingEquipmentRespawn) {
        client.pendingEquipmentRespawn = false;

        broadcastToBattle(new RemoveTankPacket(user.username));

        const tankModelJson = BattleWorkflow.getTankModelDataJson(client, battle);
        broadcastToBattle(new TankModelDataPacket(tankModelJson));

        broadcastToBattle(new EquipmentChangedPacket(user.username));
      }

      client.battleState = "newcome";
      client.currentHealth = ItemUtils.getHullArmor(user);

      const clientHealth = 10000;

      client.sendPacket(new SetHealthPacket({ nickname: user.username, health: clientHealth }));

      const spawnPoint = client.pendingSpawnPoint;
      if (!spawnPoint) {
        logger.error(`No pending spawn point for ${client.user.username}. This should not happen.`);
        client.closeConnection();
        return;
      }
      client.pendingSpawnPoint = null;

      const spawnPosition = spawnPoint.position;
      const spawnRotation = spawnPoint.rotation;

      client.battlePosition = spawnPosition;
      client.battleOrientation = spawnRotation;

      let teamId = 2;
      if (battle.isTeamMode()) {
        if (battle.usersBlue.some((u) => u.id === user.id)) teamId = 1;
        if (battle.usersRed.some((u) => u.id === user.id)) teamId = 0;
      }

      const spawnPacket = new SpawnPacket({
        nickname: user.username,
        team: teamId,
        position: spawnPosition,
        orientation: spawnRotation,
        health: clientHealth,
        incarnation: client.battleIncarnation,
      });

      broadcastToBattle(spawnPacket);
    } catch (error: any) {
      logger.error(`Failed to execute spawn logic for user ${client.user.username}`, { error });
    }
  }
}