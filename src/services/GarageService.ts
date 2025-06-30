import { itemBlueprints } from "../config/ItemData";
import { UserDocument } from "../models/User";
import logger from "../utils/Logger";

export class GarageService {
  private _parseItemId(fullItemId: string): { baseId: string; modification: number } {
    const parts = fullItemId.split("_m");
    const baseId = parts[0];
    const modification = parts.length > 1 ? parseInt(parts[1], 10) : 0;
    if (isNaN(modification)) {
      throw new Error(`Formato de ID de item inválido: ${fullItemId}`);
    }
    return { baseId, modification };
  }

  private _findItemBlueprint(baseId: string): any | undefined {
    const turret = itemBlueprints.turrets.find((i) => i.id === baseId);
    if (turret) return turret;

    const hull = itemBlueprints.hulls.find((i) => i.id === baseId);
    if (hull) return hull;

    const paint = itemBlueprints.paints.find((i) => i.id === baseId);
    if (paint) return paint;

    return undefined;
  }

  public async purchaseItem(user: UserDocument, fullItemId: string, quantity: number, expectedPrice: number): Promise<void> {
    const { baseId, modification: clientRefMod } = this._parseItemId(fullItemId);
    const itemBlueprint = this._findItemBlueprint(baseId);

    if (!itemBlueprint) throw new Error("Item não encontrado.");

    let effectivePrice: number;
    let finalModId: number = 0;

    switch (itemBlueprint.category) {
      case "weapon":
      case "armor": {
        if (quantity !== 1) throw new Error("Equipamentos só podem ser comprados em quantidade de 1.");

        const inventoryMap = itemBlueprint.category === "weapon" ? user.turrets : user.hulls;
        const currentUserMod = inventoryMap.get(baseId);

        if (currentUserMod === undefined) {
          if (clientRefMod !== 0) throw new Error("A primeira compra de um item deve ser a modificação M0.");
          finalModId = 0;
        } else {
          if (clientRefMod !== currentUserMod) throw new Error("Tentativa de upgrade para um item que não corresponde à sua modificação atual.");
          finalModId = currentUserMod + 1;
        }

        const targetModData = itemBlueprint.modifications.find((m: any) => m.modificationID === finalModId);
        if (!targetModData) throw new Error("A próxima modificação para este item não está disponível.");

        if (user.rank < targetModData.rank) throw new Error("Rank insuficiente para comprar esta atualização.");

        effectivePrice = targetModData.price;
        if (effectivePrice !== expectedPrice) throw new Error("O preço do item não confere. Tente novamente.");
        if (user.crystals < effectivePrice) throw new Error("Cristais insuficientes.");

        user.crystals -= effectivePrice;
        inventoryMap.set(baseId, finalModId);
        break;
      }
      case "paint": {
        if (quantity !== 1) throw new Error("Pinturas só podem ser compradas em quantidade de 1.");
        if (user.rank < itemBlueprint.rank) throw new Error("Rank insuficiente para comprar este item.");

        effectivePrice = itemBlueprint.price;
        if (effectivePrice !== expectedPrice) throw new Error("O preço do item não confere. Tente novamente.");
        if (user.crystals < effectivePrice) throw new Error("Cristais insuficientes.");

        if (user.paints.includes(baseId)) throw new Error("Você já possui esta pintura.");

        user.crystals -= effectivePrice;
        user.paints.push(baseId);
        break;
      }
      default:
        throw new Error("Tipo de item desconhecido ou não comprável.");
    }

    await user.save();
    logger.info(`User ${user.username} processed purchase for ${fullItemId}, resulting in M${finalModId} of ${baseId}.`);
  }

  public async equipItem(user: UserDocument, fullItemId: string): Promise<UserDocument> {
    const { baseId, modification } = this._parseItemId(fullItemId);
    const itemBlueprint = this._findItemBlueprint(baseId);

    if (!itemBlueprint) throw new Error("Item não encontrado.");

    switch (itemBlueprint.category) {
      case "weapon": {
        const userMod = user.turrets.get(baseId);
        if (userMod !== modification) throw new Error("Você não possui esta modificação para equipar.");
        user.equippedTurret = baseId;
        break;
      }
      case "armor": {
        const userMod = user.hulls.get(baseId);
        if (userMod !== modification) throw new Error("Você não possui esta modificação para equipar.");
        user.equippedHull = baseId;
        break;
      }
      case "paint": {
        if (!user.paints.includes(baseId)) throw new Error("Você não possui esta pintura.");
        user.equippedPaint = baseId;
        break;
      }
      default:
        throw new Error("Este item não pode ser equipado.");
    }

    logger.info(`User ${user.username} equipped ${fullItemId}`);
    return await user.save();
  }
}
