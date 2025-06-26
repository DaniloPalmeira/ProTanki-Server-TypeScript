import { IPacket } from "./IPacket";

export interface ISkipQuest extends IPacket {
  missionId: number;
}
