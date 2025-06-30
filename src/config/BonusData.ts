import { ResourceManager } from "../utils/ResourceManager";

export const getBonusData = () => ({
  bonuses: [
    { id: "nitro", resourceId: ResourceManager.getIdlowById("bonuses/nitro"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 16164153, intensity: 0.5 } },
    { id: "damage", resourceId: ResourceManager.getIdlowById("bonuses/damage"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 5889080, intensity: 0.5 } },
    { id: "armor", resourceId: ResourceManager.getIdlowById("bonuses/armor"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 8972345, intensity: 0.5 } },
    { id: "health", resourceId: ResourceManager.getIdlowById("bonuses/health"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 16220575, intensity: 0.5 } },
    { id: "crystall", resourceId: ResourceManager.getIdlowById("bonuses/crystal"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 3789046, intensity: 0.5 } },
    { id: "gold", resourceId: ResourceManager.getIdlowById("bonuses/gold"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 16175161, intensity: 0.5 } },
    { id: "special", resourceId: ResourceManager.getIdlowById("bonuses/special"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 50, attenuationEnd: 500, color: 16175161, intensity: 0.5 } },
    { id: "moon", resourceId: ResourceManager.getIdlowById("bonuses/moon"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 100, attenuationEnd: 500, color: 15044128, intensity: 1 } },
    { id: "pumpkin", resourceId: ResourceManager.getIdlowById("bonuses/pumpkin"), lifeTimeMs: 86400000, lighting: { attenuationBegin: 100, attenuationEnd: 500, color: 15044128, intensity: 1 } },
  ],
  cordResource: ResourceManager.getIdlowById("bonuses/parachute/cord"),
  parachuteInnerResource: ResourceManager.getIdlowById("bonuses/parachute/inner"),
  parachuteResource: ResourceManager.getIdlowById("bonuses/parachute/main"),
  pickupSoundResource: ResourceManager.getIdlowById("sounds/bonus_pickup"),
});
