import { Achievement } from "../../models/enums/Achievement";
import { IAchievementTips } from "../interfaces/IAchievementTips";
import { BasePacket } from "./BasePacket";

export default class AchievementTips extends BasePacket implements IAchievementTips {
  achievementIds: Achievement[];

  constructor(achievementIds: Achievement[]) {
    super();
    this.achievementIds = achievementIds;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const packet = Buffer.alloc(4 + this.achievementIds.length * 4);
    packet.writeInt32BE(this.achievementIds.length, 0);

    this.achievementIds.forEach((id, index) => {
      packet.writeInt32BE(id, 4 + index * 4);
    });

    return packet;
  }

  toString(): string {
    return `AchievementTips(ids=[${this.achievementIds.join(", ")}])`;
  }

  getId(): number {
    return 602656160;
  }
}
