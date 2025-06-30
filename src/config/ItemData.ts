import { ResourceManager } from "../utils/ResourceManager";

const getItemData = (id: string, modification: number) => {
  const modifications = itemBlueprints.turrets.find((t) => t.id === id)?.modifications || itemBlueprints.hulls.find((h) => h.id === id)?.modifications;
  return modifications?.find((m) => m.modificationID === modification);
};

export const itemBlueprints = {
  turrets: [
    {
      id: "smoky",
      name: "Canhão-fumegante",
      category: "weapon",
      baseItemId: 651066,
      modifications: [
        {
          modificationID: 0,
          name: "Canhão-fumegante",
          description: "Texto do Smoky M0",
          index: 100,
          next_price: 7100,
          next_rank: 8,
          type: 1,
          previewResourceId: () => ResourceManager.getIdlowById("turret/smoky/m0/preview"),
          rank: 1,
          price: 0,
          object3ds: () => ResourceManager.getIdlowById("turret/smoky/m0/model"),
          properts: [
            {
              property: "DAMAGE",
              value: null,
              subproperties: [
                { property: "DAMAGE_FROM", value: "22", subproperties: null },
                { property: "DAMAGE_TO", value: "28", subproperties: null },
              ],
            },
            { property: "IMPACT_FORCE", value: "175", subproperties: null },
            { property: "TURRET_TURN_SPEED", value: "71.5", subproperties: null },
            { property: "CRITICAL_HIT_CHANCE", value: "8", subproperties: null },
            { property: "CRITICAL_HIT_DAMAGE", value: "50", subproperties: null },
          ],
        },
        {
          modificationID: 1,
          name: "Canhão-fumegante",
          description: "Texto do Smoky M1",
          index: 100,
          next_price: 61400,
          next_rank: 15,
          type: 1,
          previewResourceId: () => ResourceManager.getIdlowById("turret/smoky/m1/preview"),
          rank: 8,
          price: 7100,
          object3ds: () => ResourceManager.getIdlowById("turret/smoky/m1/model"),
          properts: [
            {
              property: "DAMAGE",
              value: null,
              subproperties: [
                { property: "DAMAGE_FROM", value: "29", subproperties: null },
                { property: "DAMAGE_TO", value: "37", subproperties: null },
              ],
            },
            { property: "IMPACT_FORCE", value: "222", subproperties: null },
            { property: "TURRET_TURN_SPEED", value: "87.1", subproperties: null },
            { property: "CRITICAL_HIT_CHANCE", value: "12", subproperties: null },
            { property: "CRITICAL_HIT_DAMAGE", value: "65", subproperties: null },
          ],
        },
        {
          modificationID: 2,
          name: "Canhão-fumegante",
          description: "Texto do Smoky M2",
          index: 100,
          next_price: 166900,
          next_rank: 23,
          type: 1,
          previewResourceId: () => ResourceManager.getIdlowById("turret/smoky/m2/preview"),
          rank: 15,
          price: 61400,
          object3ds: () => ResourceManager.getIdlowById("turret/smoky/m2/model"),
          properts: [
            {
              property: "DAMAGE",
              value: null,
              subproperties: [
                { property: "DAMAGE_FROM", value: "35", subproperties: null },
                { property: "DAMAGE_TO", value: "45", subproperties: null },
              ],
            },
            { property: "IMPACT_FORCE", value: "269", subproperties: null },
            { property: "TURRET_TURN_SPEED", value: "102.6", subproperties: null },
            { property: "CRITICAL_HIT_CHANCE", value: "15", subproperties: null },
            { property: "CRITICAL_HIT_DAMAGE", value: "80", subproperties: null },
          ],
        },
        {
          modificationID: 3,
          name: "Canhão-fumegante",
          description: "Texto do Smoky M3",
          index: 100,
          next_price: 0,
          next_rank: 23,
          type: 1,
          previewResourceId: () => ResourceManager.getIdlowById("turret/smoky/m3/preview"),
          rank: 23,
          price: 166900,
          object3ds: () => ResourceManager.getIdlowById("turret/smoky/m3/model"),
          properts: [
            {
              property: "DAMAGE",
              value: null,
              subproperties: [
                { property: "DAMAGE_FROM", value: "44", subproperties: null },
                { property: "DAMAGE_TO", value: "56", subproperties: null },
              ],
            },
            { property: "IMPACT_FORCE", value: "330", subproperties: null },
            { property: "TURRET_TURN_SPEED", value: "122.6", subproperties: null },
            { property: "CRITICAL_HIT_CHANCE", value: "20", subproperties: null },
            { property: "CRITICAL_HIT_DAMAGE", value: "100", subproperties: null },
          ],
        },
      ],
    },
  ],
  hulls: [
    {
      id: "wasp",
      name: "Vespa",
      category: "armor",
      baseItemId: 629496,
      modifications: [
        {
          modificationID: 0,
          name: "Vespa",
          description: "Texto do Wasp M0",
          index: 700,
          next_price: 7650,
          next_rank: 9,
          type: 2,
          previewResourceId: () => ResourceManager.getIdlowById("hull/wasp/m0/preview"),
          rank: 2,
          price: 200,
          object3ds: () => ResourceManager.getIdlowById("hull/wasp/m0/model"),
          properts: [
            { property: "HULL_ARMOR", value: "94", subproperties: null },
            { property: "HULL_SPEED", value: "10.80", subproperties: null },
            { property: "HULL_TURN_SPEED", value: "93.9", subproperties: null },
            { property: "HULL_MASS", value: "1376", subproperties: null },
            { property: "HULL_POWER", value: null, subproperties: [{ property: "HULL_ACCELERATION", value: "9.4", subproperties: null }] },
          ],
        },
        {
          modificationID: 1,
          name: "Vespa",
          description: "Texto do Wasp M1",
          index: 700,
          next_price: 62450,
          next_rank: 16,
          type: 2,
          previewResourceId: () => ResourceManager.getIdlowById("hull/wasp/m1/preview"),
          rank: 9,
          price: 7650,
          object3ds: () => ResourceManager.getIdlowById("hull/wasp/m1/model"),
          properts: [
            { property: "HULL_ARMOR", value: "121", subproperties: null },
            { property: "HULL_SPEED", value: "11.50", subproperties: null },
            { property: "HULL_TURN_SPEED", value: "111.7", subproperties: null },
            { property: "HULL_MASS", value: "1638", subproperties: null },
            { property: "HULL_POWER", value: null, subproperties: [{ property: "HULL_ACCELERATION", value: "10.6", subproperties: null }] },
          ],
        },
        {
          modificationID: 2,
          name: "Vespa",
          description: "Texto do Wasp M2",
          index: 700,
          next_price: 172600,
          next_rank: 24,
          type: 2,
          previewResourceId: () => ResourceManager.getIdlowById("hull/wasp/m2/preview"),
          rank: 16,
          price: 62450,
          object3ds: () => ResourceManager.getIdlowById("hull/wasp/m2/model"),
          properts: [
            { property: "HULL_ARMOR", value: "149", subproperties: null },
            { property: "HULL_SPEED", value: "12.20", subproperties: null },
            { property: "HULL_TURN_SPEED", value: "129.6", subproperties: null },
            { property: "HULL_MASS", value: "1901", subproperties: null },
            { property: "HULL_POWER", value: null, subproperties: [{ property: "HULL_ACCELERATION", value: "11.7", subproperties: null }] },
          ],
        },
        {
          modificationID: 3,
          name: "Vespa",
          description: "Texto do Wasp M3",
          index: 700,
          next_price: 0,
          next_rank: 24,
          type: 2,
          previewResourceId: () => ResourceManager.getIdlowById("hull/wasp/m3/preview"),
          rank: 24,
          price: 172600,
          object3ds: () => ResourceManager.getIdlowById("hull/wasp/m3/model"),
          properts: [
            { property: "HULL_ARMOR", value: "180", subproperties: null },
            { property: "HULL_SPEED", value: "13.00", subproperties: null },
            { property: "HULL_TURN_SPEED", value: "150", subproperties: null },
            { property: "HULL_MASS", value: "2200", subproperties: null },
            { property: "HULL_POWER", value: null, subproperties: [{ property: "HULL_ACCELERATION", value: "13", subproperties: null }] },
          ],
        },
      ],
    },
  ],
  paints: [
    {
      id: "green",
      name: "Verde",
      description: "Example",
      isInventory: false,
      index: 1100,
      next_price: 0,
      next_rank: 1,
      type: 3,
      baseItemId: () => ResourceManager.getIdlowById("paint/green/preview"),
      previewResourceId: () => ResourceManager.getIdlowById("paint/green/preview"),
      rank: 1,
      category: "paint",
      properts: [],
      discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
      grouped: false,
      isForRent: false,
      price: 0,
      remainingTimeInSec: -1,
      coloring: () => ResourceManager.getIdlowById("paint/green/texture"),
    },
    {
      id: "holiday",
      name: "Feriado",
      description: "Example",
      isInventory: false,
      index: 1200,
      next_price: 0,
      next_rank: 1,
      type: 3,
      baseItemId: () => ResourceManager.getIdlowById("paint/holiday/preview"),
      previewResourceId: () => ResourceManager.getIdlowById("paint/holiday/preview"),
      rank: 1,
      category: "paint",
      properts: [],
      discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
      grouped: false,
      isForRent: false,
      price: 0,
      remainingTimeInSec: -1,
      coloring: () => ResourceManager.getIdlowById("paint/holiday/texture"),
    },
  ],
};

const formatItem = (item: any, modification: any) => ({
  id: item.id,
  name: modification.name,
  description: modification.description,
  isInventory: false,
  index: modification.index,
  next_price: modification.next_price,
  next_rank: modification.next_rank,
  type: modification.type,
  baseItemId: item.baseItemId,
  previewResourceId: modification.previewResourceId(),
  rank: modification.rank,
  category: item.category,
  properts: modification.properts,
  discount: { percent: 0, timeLeftInSeconds: -1751196680, timeToStartInSeconds: -1751196680 },
  grouped: false,
  isForRent: false,
  price: modification.price,
  remainingTimeInSec: -1,
  modificationID: modification.modificationID,
  object3ds: modification.object3ds(),
});

const formatPaint = (paint: any) => ({
  ...paint,
  baseItemId: paint.baseItemId(),
  previewResourceId: paint.previewResourceId(),
  coloring: paint.coloring(),
});

export const buildGarageData = (userInventory: any) => {
  const garageItems: any[] = [];
  const shopItems: any[] = [];

  const allItems = [...itemBlueprints.turrets, ...itemBlueprints.hulls];

  allItems.forEach((itemBlueprint) => {
    const userModification = userInventory[itemBlueprint.id] ?? -1;
    itemBlueprint.modifications.forEach((mod) => {
      const formattedItem = formatItem(itemBlueprint, mod);
      if (mod.modificationID === userModification) {
        garageItems.push(formattedItem);
      } else {
        shopItems.push(formattedItem);
      }
    });
  });

  itemBlueprints.paints.forEach((paintBlueprint) => {
    const userHasPaint = userInventory.paints?.includes(paintBlueprint.id);
    const formattedPaint = formatPaint(paintBlueprint);
    if (userHasPaint) {
      garageItems.push(formattedPaint);
    } else {
      shopItems.push(formattedPaint);
    }
  });

  garageItems.sort((a, b) => a.index - b.index);
  shopItems.sort((a, b) => a.index - b.index || a.modificationID - b.modificationID);

  return { garageItems, shopItems };
};
