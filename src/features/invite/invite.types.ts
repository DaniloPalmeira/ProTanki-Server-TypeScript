import { IEmpty } from "@/packets/interfaces/IEmpty";
import { IPacket } from "@/packets/interfaces/IPacket";

export interface IInviteCode extends IPacket {
    inviteCode: string | null;
}

export interface IInviteCodeInvalid extends IEmpty { }

export interface IInviteCodeLogin extends IPacket {
    nickname: string | null;
}

export interface IInviteCodeRegister extends IEmpty { }