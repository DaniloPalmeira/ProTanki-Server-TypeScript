import { IPacket } from "./IPacket";

export interface IRequestBattleByLink extends IPacket {
    battleId: string | null;
}