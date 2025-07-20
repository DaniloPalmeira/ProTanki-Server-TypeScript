import { itemBlueprints } from "../features/garage/garage.data";
import { UserDocument } from "../models/User";

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
}