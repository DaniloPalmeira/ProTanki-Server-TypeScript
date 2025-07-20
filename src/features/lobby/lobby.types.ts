import { IEmpty } from "../../packets/interfaces/IEmpty";
import { IPacket } from "../../packets/interfaces/IPacket";
import { BattleMode, IBattleCreationSettings } from "../battle/battle.model";

export interface IBattleInfo extends IPacket {
    jsonData: string | null;
}

export interface IBattleList extends IPacket {
    jsonData: string | null;
}

export interface IBattleDetails extends IPacket {
    jsonData: string | null;
}

export interface ICreateBattleRequest extends IPacket, IBattleCreationSettings { }
export interface ICreateBattleResponse extends IPacket {
    jsonData: string | null;
}

export interface ISelectBattle extends IPacket {
    battleId: string | null;
}

export interface IRequestBattleByLink extends IPacket {
    battleId: string | null;
}

export interface IValidateBattleName extends IPacket {
    name: string | null;
}

export interface ILobbyDataProps {
    crystals: number;
    currentRankScore: number;
    durationCrystalAbonement: number;
    hasDoubleCrystal: boolean;
    nextRankScore: number;
    place: number;
    rank: number;
    rating: number;
    score: number;
    serverNumber: number;
    nickname: string;
    userProfileUrl: string;
}
export interface ILobbyData extends ILobbyDataProps, IPacket { }

export interface IUserNotInBattle extends IPacket {
    nickname: string | null;
}

export interface IReleasePlayerSlotDmData {
    battleId: string | null;
    nickname: string | null;
}
export interface IReleasePlayerSlotDm extends IPacket, IReleasePlayerSlotDmData { }

export interface IReservePlayerSlotDm extends IPacket {
    battleId: string | null;
    nickname: string | null;
}

export interface IAddUserToBattleDmData {
    battleId: string | null;
    nickname: string | null;
    kills: number;
    score: number;
    suspicious: boolean;
}
export interface IAddUserToBattleDm extends IPacket, IAddUserToBattleDmData { }

export interface IRemoveUserFromBattleLobbyData {
    battleId: string | null;
    nickname: string | null;
}
export interface IRemoveUserFromBattleLobby extends IPacket, IRemoveUserFromBattleLobbyData { }

export interface INotifyFriendOfBattleData {
    battleId: string | null;
    mapName: string | null;
    mode: BattleMode;
    privateBattle: boolean;
    probattle: boolean;
    maxRank: number;
    minRank: number;
    serverNumber: number;
    nickname: string | null;
}
export interface INotifyFriendOfBattle extends IPacket, INotifyFriendOfBattleData { }

export interface IUnloadBattleList extends IEmpty { }

export interface IRequestLobby extends IEmpty { }