import { MapTheme } from "@/features/battle/battle.model";

export interface IMapGraphicConfig {
    angleX: number;
    angleZ: number;
    lightColor: number;
    shadowColor: number;
    fogAlpha: number;
    fogColor: number;
    farLimit: number;
    nearLimit: number;
    gravity: number;
    skyboxRevolutionSpeed: number;
    ssaoColor: number;
    dustAlpha: number;
    dustDensity: number;
    dustFarDistance: number;
    dustNearDistance: number;
    dustParticle: string;
    dustSize: number;
}

interface IBonusColorAdjust {
    redMultiplier: number;
    greenMultiplier: number;
    blueMultiplier: number;
    alphaMultiplier: number;
    redOffset: number;
    greenOffset: number;
    blueOffset: number;
    alphaOffset: number;
}

export interface IMapThemeConfig {
    graphicConfig: IMapGraphicConfig;
    bonusColorAdjust?: IBonusColorAdjust;
    bonusLightIntensity?: number;
}

const baseGraphicConfig: IMapGraphicConfig = {
    angleX: -0.85,
    angleZ: 2.5,
    lightColor: 13090219,
    shadowColor: 5530735,
    fogAlpha: 0.25,
    fogColor: 10543615,
    farLimit: 10000,
    nearLimit: 5000,
    gravity: 1000,
    skyboxRevolutionSpeed: 0.0,
    ssaoColor: 2045258,
    dustAlpha: 0.75,
    dustDensity: 0.15,
    dustFarDistance: 7000,
    dustNearDistance: 5000,
    dustParticle: "summer",
    dustSize: 200,
};

const nightGraphicConfig: Partial<IMapGraphicConfig> = {
    angleX: -0.6,
    angleZ: -0.8,
    lightColor: 3163220,
    shadowColor: 1382169,
    fogColor: 68116,
};

const nightBonusConfig = {
    bonusColorAdjust: {
        redMultiplier: 2,
        greenMultiplier: 2,
        blueMultiplier: 2,
        alphaMultiplier: 1,
        redOffset: 60,
        greenOffset: 10,
        blueOffset: 20,
        alphaOffset: 0,
    },
    bonusLightIntensity: 1,
};

export const mapThemeConfigs: Record<MapTheme, IMapThemeConfig> = {
    [MapTheme.SUMMER]: { graphicConfig: { ...baseGraphicConfig } },
    [MapTheme.WINTER]: { graphicConfig: { ...baseGraphicConfig } },
    [MapTheme.SPACE]: {
        graphicConfig: {
            ...baseGraphicConfig,
            lightColor: 7829351,
            shadowColor: 5926009,
            gravity: 300,
            skyboxRevolutionSpeed: 0.005,
        },
    },
    [MapTheme.SUMMER_DAY]: { graphicConfig: { ...baseGraphicConfig } },
    [MapTheme.WINTER_DAY]: { graphicConfig: { ...baseGraphicConfig } },
    [MapTheme.SUMMER_NIGHT]: {
        graphicConfig: { ...baseGraphicConfig, ...nightGraphicConfig },
        ...nightBonusConfig,
    },
    [MapTheme.WINTER_NIGHT]: {
        graphicConfig: { ...baseGraphicConfig, ...nightGraphicConfig },
        ...nightBonusConfig,
    },
};