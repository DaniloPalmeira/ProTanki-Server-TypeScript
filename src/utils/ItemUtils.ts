import { UserDocument } from "@/shared/models/user.model";
import { itemBlueprints } from "../features/garage/garage.data";

export class ItemUtils {
  public static getItemModification(user: UserDocument, itemType: "hull" | "turret") {
    const baseId = itemType === "hull" ? user.equippedHull : user.equippedTurret;
    const inventory = itemType === "hull" ? user.hulls : user.turrets;
    const blueprintList = itemType === "hull" ? itemBlueprints.hulls : itemBlueprints.turrets;

    const modId = inventory.get(baseId) ?? 0;
    const blueprint = blueprintList.find((bp) => bp.id === baseId);
    if (!blueprint) {
      throw new Error(`Blueprint não encontrado para ${itemType}: ${baseId}`);
    }

    const modification = blueprint.modifications.find((m) => m.modificationID === modId);
    if (!modification) {
      throw new Error(`Modificação M${modId} não encontrada para ${itemType}: ${baseId}`);
    }

    return modification;
  }

  public static getPropertyValue(modification: any, propertyName: string, subPropName?: string): number | null {
    const prop = modification.properts.find((p: any) => p.property === propertyName);
    if (!prop) return null;

    let valueSource = prop;
    if (subPropName && prop.subproperties) {
      const subProp = prop.subproperties.find((sp: any) => sp.property === subPropName);
      if (!subProp) return null;
      valueSource = subProp;
    }

    return valueSource.value ? parseFloat(valueSource.value) : null;
  }

  public static getHullArmor(user: UserDocument): number {
    const hullMod = this.getItemModification(user, "hull");
    const armor = this.getPropertyValue(hullMod, "HULL_ARMOR");
    return armor ?? 100;
  }

  private static getPhysicsValue(props: any[], propertyName: string, subPropName?: string): number {
    const prop = props.find((p) => p.property === propertyName);
    if (!prop) return 0;

    if (subPropName && prop.subproperties) {
      const subProp = prop.subproperties.find((sp: any) => sp.property === subPropName);
      return subProp ? parseFloat(subProp.value) : 0;
    }

    return prop.value ? parseFloat(prop.value) : 0;
  }

  public static getTankSpecifications(user: UserDocument) {
    const hullMod = this.getItemModification(user, "hull");
    const turretMod = this.getItemModification(user, "turret");

    return {
      speed: this.getPhysicsValue(hullMod.properts, "HULL_SPEED"),
      maxTurnSpeed: this.getPhysicsValue(hullMod.properts, "HULL_TURN_SPEED"),
      acceleration: this.getPhysicsValue(hullMod.properts, "HULL_POWER", "HULL_ACCELERATION"),
      turretTurnSpeed: this.getPhysicsValue(turretMod.properts, "TURRET_TURN_SPEED"),
    };
  }
}