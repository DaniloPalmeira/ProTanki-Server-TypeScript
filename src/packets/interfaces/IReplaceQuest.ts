import { IPacket } from "./IPacket";
import { IQuest } from "./IShowQuestsWindow";

export interface IReplaceQuest extends IPacket {
  missionToReplaceId: number;
  newQuest: IQuest;
}
