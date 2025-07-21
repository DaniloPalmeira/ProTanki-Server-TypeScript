import { IPacket } from "@/packets/packet.interfaces";

export interface IRegistrationForm {
    bgResource: number;
    enableRequiredEmail: boolean;
    maxPasswordLength: number;
    minPasswordLength: number;
}

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
export interface IGoToRecoveryPassword extends IPacket {
    email: string | null;
}
export interface IPunishment extends IPacket {
    reason: string | null;
    days: number;
    hours: number;
    minutes: number;
}
export interface IRegistration extends IPacket {
    bgResource: number;
    enableRequiredEmail: boolean;
    maxPasswordLength: number;
    minPasswordLength: number;
}