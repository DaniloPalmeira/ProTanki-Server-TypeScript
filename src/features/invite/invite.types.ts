import { IEmpty } from "@/packets/IEmpty";
import { IPacket } from "@/packets/IPacket";

export interface IInviteResponse {
    isValid: boolean;
    nickname?: string | null;
}

export interface IInviteCode extends IPacket {
    inviteCode: string | null;
}

export interface IInviteCodeInvalid extends IEmpty { }

export interface IInviteCodeLogin extends IPacket {
    nickname: string | null;
}

export interface IInviteCodeRegister extends IEmpty { }