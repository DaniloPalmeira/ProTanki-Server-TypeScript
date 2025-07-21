import { IPacket } from "@/packets/interfaces/IPacket";

export interface IGetUserInfo extends IPacket {
    nickname: string | null;
}

export interface IOnlineNotifierData extends IPacket {
    isOnline: boolean;
    server: number;
    nickname: string;
}

export interface IRankNotifierData extends IPacket {
    rank: number;
    nickname: string;
}

export interface IPremiumNotifierData extends IPacket {
    premiumTimeLeftInSeconds: number;
    nickname: string;
}