import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IPremiumInfo } from "../interfaces/IPremiumInfo";
import { BasePacket } from "./BasePacket";

export default class PremiumInfo extends BasePacket implements IPremiumInfo {
  needShowNotificationCompletionPremium: boolean = false;
  needShowWelcomeAlert: boolean = false;
  reminderCompletionPremiumTime: number = 0;
  wasShowAlertForFirstPurchasePremium: boolean = false;
  wasShowReminderCompletionPremium: boolean = false;
  lifeTimeInSeconds: number = 0;

  constructor(lifeTimeInSeconds?: number, needShowNotification?: boolean, needShowWelcome?: boolean) {
    super();
    if (lifeTimeInSeconds !== undefined) {
      this.lifeTimeInSeconds = lifeTimeInSeconds;
    }
    if (needShowNotification !== undefined) {
      this.needShowNotificationCompletionPremium = needShowNotification;
    }
    if (needShowWelcome !== undefined) {
      this.needShowWelcomeAlert = needShowWelcome;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.needShowNotificationCompletionPremium = reader.readUInt8() === 1;
    this.needShowWelcomeAlert = reader.readUInt8() === 1;
    this.reminderCompletionPremiumTime = reader.readFloatBE();
    this.wasShowAlertForFirstPurchasePremium = reader.readUInt8() === 1;
    this.wasShowReminderCompletionPremium = reader.readUInt8() === 1;
    this.lifeTimeInSeconds = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.needShowNotificationCompletionPremium ? 1 : 0);
    writer.writeUInt8(this.needShowWelcomeAlert ? 1 : 0);
    writer.writeFloatBE(this.reminderCompletionPremiumTime);
    writer.writeUInt8(this.wasShowAlertForFirstPurchasePremium ? 1 : 0);
    writer.writeUInt8(this.wasShowReminderCompletionPremium ? 1 : 0);
    writer.writeInt32BE(this.lifeTimeInSeconds);
    return writer.getBuffer();
  }

  toString(): string {
    return `PremiumInfo(\n` + `  lifeTimeInSeconds=${this.lifeTimeInSeconds},\n` + `  needShowNotificationCompletionPremium=${this.needShowNotificationCompletionPremium},\n` + `  needShowWelcomeAlert=${this.needShowWelcomeAlert},\n` + `  reminderCompletionPremiumTime=${this.reminderCompletionPremiumTime},\n` + `  wasShowAlertForFirstPurchasePremium=${this.wasShowAlertForFirstPurchasePremium},\n` + `  wasShowReminderCompletionPremium=${this.wasShowReminderCompletionPremium}\n` + `)`;
  }

  static getId(): number {
    return 1405859779;
  }
}
