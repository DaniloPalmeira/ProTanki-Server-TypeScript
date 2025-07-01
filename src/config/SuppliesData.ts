export interface ISupplyData {
  id: string;
  slotId: number;
  itemEffectTime: number;
  itemRestSec: number;
}

export const suppliesData: ISupplyData[] = [
  { id: "health", slotId: 1, itemEffectTime: 0, itemRestSec: 30 },
  { id: "armor", slotId: 2, itemEffectTime: 60, itemRestSec: 15 },
  { id: "double_damage", slotId: 3, itemEffectTime: 60, itemRestSec: 15 },
  { id: "n2o", slotId: 4, itemEffectTime: 60, itemRestSec: 15 },
  { id: "mine", slotId: 5, itemEffectTime: 0, itemRestSec: 30 },
];
