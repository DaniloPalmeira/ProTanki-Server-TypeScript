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

    // Hardcoded for now as their logic is not specified
    this.reminderCompletionPremiumTime = 0;
    this.wasShowAlertForFirstPurchasePremium = false;
    this.wasShowReminderCompletionPremium = false;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const packet = Buffer.alloc(12);
    let offset = 0;

    packet.writeInt8(this.needShowNotificationCompletionPremium ? 1 : 0, offset);
    offset += 1;

    packet.writeInt8(this.needShowWelcomeAlert ? 1 : 0, offset);
    offset += 1;

    packet.writeFloatBE(this.reminderCompletionPremiumTime, offset);
    offset += 4;

    packet.writeInt8(this.wasShowAlertForFirstPurchasePremium ? 1 : 0, offset);
    offset += 1;

    packet.writeInt8(this.wasShowReminderCompletionPremium ? 1 : 0, offset);
    offset += 1;

    packet.writeInt32BE(this.lifeTimeInSeconds, offset);
    offset += 4;

    return packet;
  }

  toString(): string {
    return `PremiumInfo(lifeTimeInSeconds=${this.lifeTimeInSeconds})`;
  }

  static getId(): number {
    return 1405859779;
  }
}
