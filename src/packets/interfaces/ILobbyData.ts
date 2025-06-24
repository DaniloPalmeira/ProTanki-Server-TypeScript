import { IPacket } from "./IPacket";

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

export interface ILobbyData extends ILobbyDataProps, IPacket {}