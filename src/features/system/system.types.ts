import { IEmpty } from "@/packets/IEmpty";
import { IPacket } from "@/packets/IPacket";

export interface ISystemMessage extends IPacket {
    text: string | null;
}

export interface IPing extends IEmpty { }
export interface IPong extends IEmpty { }

export interface ICaptchaLocation extends IPacket {
    captchaLocations: Array<number>;
}

export interface IInviteEnabled extends IPacket {
    requireInviteCode: boolean;
}

export interface IConfirmLayoutChange extends IPacket {
    fromLayout: number;
    toLayout: number;
}

export interface ISetLayout extends IPacket {
    layoutId: number;
}

export interface IProtection extends IPacket {
    keys: Array<number>;
}