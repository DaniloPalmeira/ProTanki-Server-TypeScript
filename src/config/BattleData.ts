import { ResourceId } from "../types/resourceTypes";

interface IMapData {
  enabled: boolean;
  additionalCrystalsPercent: number;
  mapId: string;
  mapName: string;
  maxPeople: number;
  previewResource: ResourceId;
  maxRank: number;
  minRank: number;
  supportedModes: string[];
  theme: string;
}

interface IBattleData {
  maxRangeLength: number;
  battleCreationDisabled: boolean;
  battleLimits: { battleMode: string; scoreLimit: number; timeLimitInSec: number }[];
  proBattleTimeLeftInSec: number;
  maps: IMapData[];
}

export const battleDataObject: IBattleData = {
  maxRangeLength: 10,
  battleCreationDisabled: false,
  battleLimits: [
    { battleMode: "DM", scoreLimit: 999, timeLimitInSec: 59940 },
    { battleMode: "TDM", scoreLimit: 9999, timeLimitInSec: 59940 },
    { battleMode: "CTF", scoreLimit: 999, timeLimitInSec: 59940 },
    { battleMode: "CP", scoreLimit: 999, timeLimitInSec: 59940 },
    { battleMode: "AS", scoreLimit: 999, timeLimitInSec: 59940 },
  ],
  proBattleTimeLeftInSec: 2591999,
  maps: [
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandbox", mapName: "Caixa de areia", maxPeople: 8, previewResource: "maps/map_sandbox/preview/SUMMER", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SUMMER" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandbox", mapName: "Caixa de areia", maxPeople: 8, previewResource: "maps/map_sandbox/preview/WINTER", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "WINTER" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandbox", mapName: "Caixa de areia", maxPeople: 8, previewResource: "maps/map_sandbox/preview/SUMMER_NIGHT", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SUMMER_NIGHT" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandbox", mapName: "Caixa de areia", maxPeople: 8, previewResource: "maps/map_sandbox/preview/SPACE", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SPACE" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandal", mapName: "Sandália", maxPeople: 12, previewResource: "maps/map_sandal/preview/SUMMER", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SUMMER" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandal", mapName: "Sandália", maxPeople: 12, previewResource: "maps/map_sandal/preview/WINTER", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "WINTER" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_sandal", mapName: "Sandália", maxPeople: 12, previewResource: "maps/map_sandal/preview/SPACE", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SPACE" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_serpuhov", mapName: "Serpuhov", maxPeople: 20, previewResource: "maps/map_serpuhov/preview/SUMMER", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SUMMER" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_serpuhov", mapName: "Serpuhov", maxPeople: 20, previewResource: "maps/map_serpuhov/preview/WINTER", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "WINTER" },
    { enabled: true, additionalCrystalsPercent: 0, mapId: "map_serpuhov", mapName: "Serpuhov", maxPeople: 20, previewResource: "maps/map_serpuhov/preview/SPACE", maxRank: 30, minRank: 1, supportedModes: ["DM", "TDM", "CTF", "CP"], theme: "SPACE" },
  ],
};
