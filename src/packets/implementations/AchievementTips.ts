import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { Achievement } from "../../models/enums/Achievement";
import { IAchievementTips } from "../interfaces/IAchievementTips";
import { BasePacket } from "./BasePacket";

export default class AchievementTips extends BasePacket implements IAchievementTips {
  achievementIds: Achievement[] = [];

  constructor(achievementIds?: Achievement[]) {
    super();
    if (achievementIds) {
      this.achievementIds = achievementIds;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    const count = reader.readInt32BE();
    this.achievementIds = [];
    for (let i = 0; i < count; i++) {
      this.achievementIds.push(reader.readInt32BE());
    }
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.achievementIds.length);
    this.achievementIds.forEach((id) => {
      writer.writeInt32BE(id);
    });
    return writer.getBuffer();
  }

  toString(): string {
    return `AchievementTips(ids=[${this.achievementIds.join(", ")}])`;
  }

  static getId(): number {
    return 602656160;
  }
}
