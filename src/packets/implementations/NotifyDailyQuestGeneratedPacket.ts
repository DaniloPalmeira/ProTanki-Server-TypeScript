import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { INotifyDailyQuestGenerated } from "../interfaces/INotifyDailyQuestGenerated";
import { BasePacket } from "./BasePacket";

export default class NotifyDailyQuestGeneratedPacket extends BasePacket implements INotifyDailyQuestGenerated {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "NotifyDailyQuestGeneratedPacket()";
  }

  static getId(): number {
    return 956252237;
  }
}
