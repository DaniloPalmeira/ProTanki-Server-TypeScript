import { IPacket } from "@/packets/interfaces/IPacket";
import { IEmpty } from "@/packets/interfaces/IEmpty";

export interface ILanguage extends IPacket {
    lang: string | null;
}
export interface ICreateAccount extends IPacket {
    nickname: string | null;
    password: string | null;
    rememberMe: boolean;
}
export interface ILogin extends IPacket {
    username: string | null;
    password: string | null;
    rememberMe: boolean;
}
export interface ILoginByTokenRequest extends IPacket {
    hash: string | null;
}
export interface ILoginToken extends IPacket {
    hash: string | null;
}
export interface ICheckNicknameAvailable extends IPacket {
    nickname: string | null;
}
export interface INicknameUnavailable extends IPacket {
    suggestions: string[] | null;
}
export interface ICaptcha extends IPacket {
    view: number;
    image: Buffer;
}
export interface ICaptchaVerify extends IPacket {
    view: number;
    solution: string | null;
}
export interface ICaptchaView extends IPacket {
    view: number;
}
export interface IRequestCaptcha extends IPacket {
    view: number;
}
export interface IRecoveryAccountSendCode extends IPacket {
    email: string | null;
}
export interface IRecoveryAccountVerifyCode extends IPacket {
    code: string | null;
}
export interface IUpdatePassword extends IPacket {
    password: string | null;
    email: string | null;
}
export interface IUpdatePasswordResult extends IPacket {
    isError: boolean;
    message: string | null;
}
export interface IGoToRecoveryPassword extends IPacket {
    email: string | null;
}
export interface ILinkEmailRequest extends IPacket {
    email: string | null;
}
export interface ILinkAccountResultSuccess extends IPacket {
    identifier: string | null;
}
export interface ILinkAccountFailedAccountInUse extends IPacket {
    method: string | null;
}