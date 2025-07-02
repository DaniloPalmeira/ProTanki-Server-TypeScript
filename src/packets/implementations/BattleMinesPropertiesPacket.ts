import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IBattleMine } from "../interfaces/IBattleMine";
import { IBattleMinesProperties, IBattleMinesPropertiesData } from "../interfaces/IBattleMinesProperties";
import { BasePacket } from "./BasePacket";

export default class BattleMinesPropertiesPacket extends BasePacket implements IBattleMinesProperties {
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

  constructor(data?: IBattleMinesPropertiesData) {
    super();
    this.activateSound = data?.activateSound ?? 0;
    this.activateTimeMsec = data?.activateTimeMsec ?? 0;
    this.battleMines = data?.battleMines ?? [];
    this.blueMineTexture = data?.blueMineTexture ?? 0;
    this.deactivateSound = data?.deactivateSound ?? 0;
    this.enemyMineTexture = data?.enemyMineTexture ?? 0;
    this.explosionMarkTexture = data?.explosionMarkTexture ?? 0;
    this.explosionSound = data?.explosionSound ?? 0;
    this.farVisibilityRadius = data?.farVisibilityRadius ?? 0;
    this.friendlyMineTexture = data?.friendlyMineTexture ?? 0;
    this.idleExplosionTexture = data?.idleExplosionTexture ?? 0;
    this.impactForce = data?.impactForce ?? 0;
    this.mainExplosionTexture = data?.mainExplosionTexture ?? 0;
    this.minDistanceFromBase = data?.minDistanceFromBase ?? 0;
    this.model3ds = data?.model3ds ?? 0;
    this.nearVisibilityRadius = data?.nearVisibilityRadius ?? 0;
    this.radius = data?.radius ?? 0;
    this.redMineTexture = data?.redMineTexture ?? 0;
  }

  private readMines(reader: BufferReader): IBattleMine[] {
    const mines: IBattleMine[] = [];
    const count = reader.readInt32BE();
    for (let i = 0; i < count; i++) {
      const activated = reader.readUInt8() === 1;
      const mineId = reader.readOptionalString();
      const ownerId = reader.readOptionalString();
      const position: IVector3 = {
        x: reader.readFloatBE(),
        y: reader.readFloatBE(),
        z: reader.readFloatBE(),
      };
      mines.push({ activated, mineId, ownerId, position });
    }
    return mines;
  }

  private writeMines(writer: BufferWriter, mines: IBattleMine[]): void {
    writer.writeInt32BE(mines.length);
    for (const mine of mines) {
      writer.writeUInt8(mine.activated ? 1 : 0);
      writer.writeOptionalString(mine.mineId);
      writer.writeOptionalString(mine.ownerId);
      writer.writeFloatBE(mine.position.x);
      writer.writeFloatBE(mine.position.y);
      writer.writeFloatBE(mine.position.z);
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.activateSound = reader.readInt32BE();
    this.activateTimeMsec = reader.readInt32BE();
    this.battleMines = this.readMines(reader);
    this.blueMineTexture = reader.readInt32BE();
    this.deactivateSound = reader.readInt32BE();
    this.enemyMineTexture = reader.readInt32BE();
    this.explosionMarkTexture = reader.readInt32BE();
    this.explosionSound = reader.readInt32BE();
    this.farVisibilityRadius = reader.readFloatBE();
    this.friendlyMineTexture = reader.readInt32BE();
    this.idleExplosionTexture = reader.readInt32BE();
    this.impactForce = reader.readFloatBE();
    this.mainExplosionTexture = reader.readInt32BE();
    this.minDistanceFromBase = reader.readFloatBE();
    this.model3ds = reader.readInt32BE();
    this.nearVisibilityRadius = reader.readFloatBE();
    this.radius = reader.readFloatBE();
    this.redMineTexture = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.activateSound);
    writer.writeInt32BE(this.activateTimeMsec);
    this.writeMines(writer, this.battleMines);
    writer.writeInt32BE(this.blueMineTexture);
    writer.writeInt32BE(this.deactivateSound);
    writer.writeInt32BE(this.enemyMineTexture);
    writer.writeInt32BE(this.explosionMarkTexture);
    writer.writeInt32BE(this.explosionSound);
    writer.writeFloatBE(this.farVisibilityRadius);
    writer.writeInt32BE(this.friendlyMineTexture);
    writer.writeInt32BE(this.idleExplosionTexture);
    writer.writeFloatBE(this.impactForce);
    writer.writeInt32BE(this.mainExplosionTexture);
    writer.writeFloatBE(this.minDistanceFromBase);
    writer.writeInt32BE(this.model3ds);
    writer.writeFloatBE(this.nearVisibilityRadius);
    writer.writeFloatBE(this.radius);
    writer.writeInt32BE(this.redMineTexture);
    return writer.getBuffer();
  }

  toString(): string {
    return (
      `BattleMinesPropertiesPacket(\n` +
      `  activateSound=${this.activateSound},\n` +
      `  activateTimeMsec=${this.activateTimeMsec},\n` +
      `  battleMines=${JSON.stringify(this.battleMines)},\n` +
      `  blueMineTexture=${this.blueMineTexture},\n` +
      `  deactivateSound=${this.deactivateSound},\n` +
      `  enemyMineTexture=${this.enemyMineTexture},\n` +
      `  explosionMarkTexture=${this.explosionMarkTexture},\n` +
      `  explosionSound=${this.explosionSound},\n` +
      `  farVisibilityRadius=${this.farVisibilityRadius},\n` +
      `  friendlyMineTexture=${this.friendlyMineTexture},\n` +
      `  idleExplosionTexture=${this.idleExplosionTexture},\n` +
      `  impactForce=${this.impactForce},\n` +
      `  mainExplosionTexture=${this.mainExplosionTexture},\n` +
      `  minDistanceFromBase=${this.minDistanceFromBase},\n` +
      `  model3ds=${this.model3ds},\n` +
      `  nearVisibilityRadius=${this.nearVisibilityRadius},\n` +
      `  radius=${this.radius},\n` +
      `  redMineTexture=${this.redMineTexture}\n` +
      `)`
    );
  }

  static getId(): number {
    return -226978906;
  }
}
