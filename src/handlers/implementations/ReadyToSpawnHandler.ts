import { IPacketHandler } from "../IPacketHandler";
import ReadyToSpawnPacket from "../../packets/implementations/ReadyToSpawnPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { itemBlueprints } from "../../config/ItemData";
import { UserDocument } from "../../models/User";
import TankSpecificationPacket from "../../packets/implementations/TankSpecificationPacket";

const getPhysicsValue = (props: any[], propertyName: string, subPropName?: string): number => {
  const prop = props.find((p) => p.property === propertyName);
  if (!prop) return 0;

  if (subPropName && prop.subproperties) {
    const subProp = prop.subproperties.find((sp: any) => sp.property === subPropName);
    return subProp ? parseFloat(subProp.value) : 0;
  }

  return prop.value ? parseFloat(prop.value) : 0;
};

const getTankSpecifications = (user: UserDocument) => {
  const hullId = user.equippedHull;
  const hullModId = user.hulls.get(hullId) ?? 0;
  const hullBlueprint = itemBlueprints.hulls.find((h) => h.id === hullId);
  const hullMod = hullBlueprint?.modifications.find((m) => m.modificationID === hullModId);

  const turretId = user.equippedTurret;
  const turretModId = user.turrets.get(turretId) ?? 0;
  const turretBlueprint = itemBlueprints.turrets.find((t) => t.id === turretId);
  const turretMod = turretBlueprint?.modifications.find((m) => m.modificationID === turretModId);

  if (!hullMod || !turretMod) {
    throw new Error(`Could not find equipped items for user ${user.username}`);
  }

  return {
    speed: getPhysicsValue(hullMod.properts, "HULL_SPEED"),
    maxTurnSpeed: getPhysicsValue(hullMod.properts, "HULL_TURN_SPEED"),
    acceleration: getPhysicsValue(hullMod.properts, "HULL_POWER", "HULL_ACCELERATION"),
    turretTurnSpeed: getPhysicsValue(turretMod.properts, "TURRET_TURN_SPEED"),
  };
};

export default class ReadyToSpawnHandler implements IPacketHandler<ReadyToSpawnPacket> {
  public readonly packetId = ReadyToSpawnPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ReadyToSpawnPacket): void {
    if (!client.user || !client.currentBattle) {
      return;
    }

    logger.info(`Client ${client.user.username} is ready to spawn in battle ${client.currentBattle.battleId}.`);

    try {
      const specs = getTankSpecifications(client.user);

      client.sendPacket(
        new TankSpecificationPacket({
          nickname: client.user.username,
          speed: specs.speed,
          maxTurnSpeed: specs.maxTurnSpeed,
          turretTurnSpeed: specs.turretTurnSpeed,
          acceleration: specs.acceleration,
          isPro: true,
        })
      );
    } catch (error: any) {
      logger.error(`Failed to get tank specifications for user ${client.user.username}`, { error });
    }
  }
}
