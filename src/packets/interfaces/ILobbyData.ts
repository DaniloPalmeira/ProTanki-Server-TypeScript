import { IPacket } from "./IPacket";

// 1. Criamos uma interface base apenas com as propriedades de DADOS.
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

// 2. A interface principal do pacote agora é uma COMPOSIÇÃO da base + IPacket.
export interface ILobbyData extends ILobbyDataProps, IPacket {}