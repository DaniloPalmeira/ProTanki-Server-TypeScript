import { IPacket } from "./IPacket";
import { IBattleMine } from "./IBattleMine";

export interface IBattleMinesPropertiesData {
  activateSound: number;
  activateTimeMsec: number;
  battleMines: IBattleMine[];
  blueMineTexture: number;
  deactivateSound: number;
  enemyMineTexture: number;
  explosionMarkTexture: number;
  explosionSound: number;
  farVisibilityRadius: number;
  friendlyMineTexture: number;
  idleExplosionTexture: number;
  impactForce: number;
  mainExplosionTexture: number;
  minDistanceFromBase: number;
  model3ds: number;
  nearVisibilityRadius: number;
  radius: number;
  redMineTexture: number;
}

export interface IBattleMinesProperties extends IPacket, IBattleMinesPropertiesData {}
