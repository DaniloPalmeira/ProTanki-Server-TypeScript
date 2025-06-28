import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IUserSettingsNotifications } from "../interfaces/IUserSettingsNotifications";

export default class UserSettingsNotifications extends BasePacket implements IUserSettingsNotifications {
  notificationsEnabled: boolean = false;

  constructor(enabled?: boolean) {
    super();
    if (enabled !== undefined) {
      this.notificationsEnabled = enabled;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.notificationsEnabled = reader.readUInt8() === 1;
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.notificationsEnabled ? 1 : 0);
    return writer.getBuffer();
  }

  toString(): string {
    return `UserSettingsNotifications(enabled=${this.notificationsEnabled})`;
  }

  static getId(): number {
    return 1447082276;
  }
}
