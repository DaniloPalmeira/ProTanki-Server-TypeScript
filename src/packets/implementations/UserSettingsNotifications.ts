import { BasePacket } from "./BasePacket";
import { IUserSettingsNotifications } from "../interfaces/IUserSettingsNotifications";

export default class UserSettingsNotifications extends BasePacket implements IUserSettingsNotifications {
  notificationsEnabled: boolean;

  constructor(enabled: boolean) {
    super();
    this.notificationsEnabled = enabled;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const packet = Buffer.alloc(1);
    packet.writeUInt8(this.notificationsEnabled ? 1 : 0, 0);
    return packet;
  }

  toString(): string {
    return `UserSettingsNotifications(enabled=${this.notificationsEnabled})`;
  }

  static getId(): number {
    return 1447082276;
  }
}
