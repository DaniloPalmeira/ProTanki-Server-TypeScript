import { IPacket } from "./IPacket";

export interface IPremiumInfo extends IPacket {
  needShowNotificationCompletionPremium: boolean;
  needShowWelcomeAlert: boolean;
  reminderCompletionPremiumTime: number;
  wasShowAlertForFirstPurchasePremium: boolean;
  wasShowReminderCompletionPremium: boolean;
  lifeTimeInSeconds: number;
}
