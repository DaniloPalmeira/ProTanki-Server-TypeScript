import { IEmpty, IPacket } from "@/packets/packet.interfaces";

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