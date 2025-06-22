import { IPacket } from "./IPacket";

export interface ICreateAccount extends IPacket {
    nickname?: string;
    password?: string;
    rememberMe: boolean;
}