import { IPacketHandler } from "../IPacketHandler";
import ReadyToPlacePacket from "../../packets/implementations/ReadyToPlacePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { UserDocument } from "../../models/User";
import { itemBlueprints } from "../../config/ItemData";
import SetHealthPacket from "../../packets/implementations/SetHealthPacket";
import SpawnPacket from "../../packets/implementations/SpawnPacket";

const getHullHealth = (user: UserDocument): number => {
  const hullId = user.equippedHull;
  const hullModId = user.hulls.get(hullId) ?? 0;
  const hullBlueprint = itemBlueprints.hulls.find((h) => h.id === hullId);
  const hullMod = hullBlueprint?.modifications.find((m) => m.modificationID === hullModId);

  if (!hullMod) {
    throw new Error(`Could not find hull blueprint for ${hullId}_m${hullModId}`);
  }

  const healthProp = hullMod.properts.find((p) => p.property === "HULL_ARMOR");
  return healthProp && healthProp.value ? parseInt(healthProp.value, 10) : 100;
};

export default class ReadyToPlaceHandler implements IPacketHandler<ReadyToPlacePacket> {
  public readonly packetId = ReadyToPlacePacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ReadyToPlacePacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    logger.info(`Placing user ${client.user.username} on the battlefield ${client.currentBattle.battleId}.`);

    try {
      const battle = client.currentBattle;
      const user = client.user;

      client.battleState = "active";

      const maxHealth = getHullHealth(user);
      const clientHealth = 10000;

      client.sendPacket(new SetHealthPacket({ nickname: user.username, health: clientHealth }));

      const spawnPosition = { x: 1010.1729736328125, y: -4518.43994140625, z: 200 };
      const spawnRotation = { x: 0, y: 0, z: -6.894000053405762 };

      client.battlePosition = spawnPosition;
      client.battleOrientation = spawnRotation;

      let teamId = 2; // NONE
      if (battle.isTeamMode()) {
        if (battle.usersBlue.some((u) => u.id === user.id)) teamId = 1; // BLUE
        if (battle.usersRed.some((u) => u.id === user.id)) teamId = 0; // RED
      }

      const spawnPacket = new SpawnPacket({
        nickname: user.username,
        team: teamId,
        position: spawnPosition,
        orientation: spawnRotation,
        health: clientHealth,
        incarnation: client.battleIncarnation,
      });

      const allPlayers = [...battle.users, ...battle.usersBlue, ...battle.usersRed];
      for (const player of allPlayers) {
        const playerClient = server.findClientByUsername(player.username);
        if (playerClient && playerClient.currentBattle?.battleId === battle.battleId) {
          playerClient.sendPacket(spawnPacket);
        }
      }
    } catch (error: any) {
      logger.error(`Failed to execute spawn logic for user ${client.user.username}`, { error });
    }
  }
}
