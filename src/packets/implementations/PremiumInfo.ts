import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IPremiumInfo } from "../interfaces/IPremiumInfo";
import { BasePacket } from "./BasePacket";

export default class PremiumInfo extends BasePacket implements IPremiumInfo {
  needShowNotificationCompletionPremium: boolean;
  needShowWelcomeAlert: boolean;
  reminderCompletionPremiumTime: number;
  wasShowAlertForFirstPurchasePremium: boolean;
  wasShowReminderCompletionPremium: boolean;
  lifeTimeInSeconds: number;

  constructor(lifeTimeInSeconds: number = 0, needShowNotification: boolean = false, needShowWelcome: boolean = false) {
    super();
    this.lifeTimeInSeconds = lifeTimeInSeconds;
    this.needShowNotificationCompletionPremium = needShowNotification;
    this.needShowWelcomeAlert = needShowWelcome;
    this.reminderCompletionPremiumTime = 0;
    this.wasShowAlertForFirstPurchasePremium = false;
    this.wasShowReminderCompletionPremium = false;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
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
    return `PremiumInfo(lifeTimeInSeconds=${this.lifeTimeInSeconds})`;
  }

  static getId(): number {
    return 1405859779;
  }
}
