import { IPacket } from "./IPacket";

export interface ISetNotifications extends IPacket {
  enabled: boolean;
}
