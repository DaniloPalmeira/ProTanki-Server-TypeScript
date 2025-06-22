import { IPacket } from "./IPacket";

export interface ILogin extends IPacket {
    username?: string;
    password?: string;
    rememberMe: boolean;
}