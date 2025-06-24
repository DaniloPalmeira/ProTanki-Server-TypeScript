import { Achievement } from "../../models/enums/Achievement";
import { IPacket } from "./IPacket";

export interface IAchievementTips extends IPacket {
  achievementIds: Achievement[];
}
