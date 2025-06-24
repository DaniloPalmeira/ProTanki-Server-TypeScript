import { IPacket } from "./IPacket";

export interface IUserSettingsNotifications extends IPacket {
  notificationsEnabled: boolean;
}
