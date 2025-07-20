import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import { BasePacket } from "@/packets/implementations/BasePacket";
import { IEmpty } from "@/packets/interfaces/IEmpty";
import * as AuthTypes from "./auth.types";

export class Language extends BasePacket implements AuthTypes.ILanguage {
    lang: string | null;
    constructor(lang: string | null = null) { super(); this.lang = lang; }
    read(buffer: Buffer) { this.lang = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.lang).getBuffer(); }
    static getId() { return -1864333717; }
}

export class CreateAccount extends BasePacket implements AuthTypes.ICreateAccount {
    nickname: string | null = null;
    password: string | null = null;
    rememberMe: boolean = false;
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.nickname = r.readOptionalString(); this.password = r.readOptionalString(); this.rememberMe = r.readUInt8() === 1; }
    write(): Buffer { const w = new BufferWriter(); w.writeOptionalString(this.nickname); w.writeOptionalString(this.password); w.writeUInt8(this.rememberMe ? 1 : 0); return w.getBuffer(); }
    static getId() { return 427083290; }
}

export class Login extends BasePacket implements AuthTypes.ILogin {
    username: string | null = null;
    password: string | null = null;
    rememberMe: boolean = false;
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.username = r.readOptionalString(); this.password = r.readOptionalString(); this.rememberMe = r.readUInt8() === 1; }
    write(): Buffer { const w = new BufferWriter(); w.writeOptionalString(this.username); w.writeOptionalString(this.password); w.writeUInt8(this.rememberMe ? 1 : 0); return w.getBuffer(); }
    static getId() { return -739684591; }
}

export class LoginByTokenRequestPacket extends BasePacket implements AuthTypes.ILoginByTokenRequest {
    hash: string | null;
    constructor(hash: string | null = null) { super(); this.hash = hash; }
    read(buffer: Buffer) { this.hash = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.hash).getBuffer(); }
    static getId() { return -845588810; }
}

export class LoginTokenPacket extends BasePacket implements AuthTypes.ILoginToken {
    hash: string | null;
    constructor(hash: string | null = null) { super(); this.hash = hash; }
    read(buffer: Buffer) { this.hash = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.hash).getBuffer(); }
    static getId() { return 932564569; }
}

export class IncorrectPassword extends BasePacket implements IEmpty {
    read(buffer: Buffer) { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId() { return 103812952; }
}

export class CheckNicknameAvailable extends BasePacket implements AuthTypes.ICheckNicknameAvailable {
    nickname: string | null;
    constructor(nickname: string | null) { super(); this.nickname = nickname; }
    read(buffer: Buffer) { this.nickname = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.nickname).getBuffer(); }
    static getId() { return 1083705823; }
}

export class NicknameAvailable extends BasePacket implements IEmpty {
    read(buffer: Buffer) { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId() { return -706679202; }
}

export class NicknameUnavailable extends BasePacket implements AuthTypes.INicknameUnavailable {
    suggestions: string[] | null = null;
    constructor(suggestions?: string[] | null) { super(); if (suggestions) { this.suggestions = suggestions; } }
    read(buffer: Buffer) { this.suggestions = new BufferReader(buffer).readStringArray(); }
    write(): Buffer { return new BufferWriter().writeOptionalStringArray(this.suggestions).getBuffer(); }
    static getId() { return 442888643; }
}

export class InvalidNickname extends BasePacket implements IEmpty {
    read(buffer: Buffer) { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId() { return 1480924803; }
}

export class RequestCaptcha extends BasePacket implements AuthTypes.IRequestCaptcha {
    view: number;
    constructor(view: number = 0) { super(); this.view = view; }
    read(buffer: Buffer) { this.view = new BufferReader(buffer).readInt32BE(); }
    write(): Buffer { return new BufferWriter().writeInt32BE(this.view).getBuffer(); }
    static getId() { return -349828108; }
}

export class Captcha extends BasePacket implements AuthTypes.ICaptcha {
    view: number;
    image: Buffer;
    constructor(view: number = 0, image: Buffer = Buffer.alloc(0)) { super(); this.view = view; this.image = image; }
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.view = r.readInt32BE(); const len = r.readInt32BE(); this.image = r.readBytes(len); }
    write(): Buffer { const w = new BufferWriter(); w.writeInt32BE(this.view); w.writeInt32BE(this.image.length); w.writeBuffer(this.image); return w.getBuffer(); }
    static getId() { return -1670408519; }
}

export class CaptchaVerify extends BasePacket implements AuthTypes.ICaptchaVerify {
    view: number;
    solution: string | null;
    constructor(view: number = 0, solution: string | null) { super(); this.view = view; this.solution = solution; }
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.view = r.readInt32BE(); this.solution = r.readOptionalString(); }
    write(): Buffer { const w = new BufferWriter(); w.writeInt32BE(this.view); w.writeOptionalString(this.solution); return w.getBuffer(); }
    static getId() { return 1271163230; }
}

export class CaptchaIsValid extends BasePacket implements AuthTypes.ICaptchaView {
    view: number = 0;
    constructor(view?: number) { super(); if (view !== undefined) this.view = view; }
    read(buffer: Buffer) { this.view = new BufferReader(buffer).readInt32BE(); }
    write(): Buffer { return new BufferWriter().writeInt32BE(this.view).getBuffer(); }
    static getId() { return -819536476; }
}

export class CaptchaIsInvalid extends BasePacket implements AuthTypes.ICaptcha {
    view: number = 0;
    image: Buffer = Buffer.alloc(0);
    constructor(view?: number, image?: Buffer) { super(); if (view !== undefined) this.view = view; if (image) this.image = image; }
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.view = r.readInt32BE(); const len = r.readInt32BE(); this.image = r.readBytes(len); }
    write(): Buffer { const w = new BufferWriter(); w.writeInt32BE(this.view); w.writeInt32BE(this.image.length); w.writeBuffer(this.image); return w.getBuffer(); }
    static getId() { return -373510957; }
}

export class RecoveryAccountSendCode extends BasePacket implements AuthTypes.IRecoveryAccountSendCode {
    email: string | null;
    constructor(email: string | null) { super(); this.email = email; }
    read(buffer: Buffer) { this.email = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.email).getBuffer(); }
    static getId() { return 1744584433; }
}

export class RecoveryEmailSent extends BasePacket implements IEmpty {
    read(buffer: Buffer) { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId() { return -1607756600; }
}

export class RecoveryEmailNotExists extends BasePacket implements IEmpty {
    read(buffer: Buffer) { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId() { return -262455387; }
}

export class RecoveryAccountVerifyCode extends BasePacket implements AuthTypes.IRecoveryAccountVerifyCode {
    code: string | null;
    constructor(code: string | null) { super(); this.code = code; }
    read(buffer: Buffer) { this.code = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.code).getBuffer(); }
    static getId() { return 903498755; }
}

export class RecoveryEmailInvalidCode extends BasePacket implements IEmpty {
    read(buffer: Buffer) { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId() { return -16447159; }
}

export class GoToRecoveryPassword extends BasePacket implements AuthTypes.IGoToRecoveryPassword {
    email: string | null = null;
    constructor(email?: string | null) { super(); if (email) this.email = email; }
    read(buffer: Buffer) { this.email = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.email).getBuffer(); }
    static getId() { return -2118900410; }
}

export class UpdatePassword extends BasePacket implements AuthTypes.IUpdatePassword {
    password: string | null = null;
    email: string | null = null;
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.password = r.readOptionalString(); this.email = r.readOptionalString(); }
    write(): Buffer { const w = new BufferWriter(); w.writeOptionalString(this.password); w.writeOptionalString(this.email); return w.getBuffer(); }
    static getId() { return 762959326; }
}

export class UpdatePasswordResult extends BasePacket implements AuthTypes.IUpdatePasswordResult {
    isError: boolean = false;
    message: string | null = null;
    constructor(isError?: boolean, message?: string | null) { super(); if (isError !== undefined) this.isError = isError; if (message) this.message = message; }
    read(buffer: Buffer) { const r = new BufferReader(buffer); this.isError = r.readUInt8() === 1; this.message = r.readOptionalString(); }
    write(): Buffer { const w = new BufferWriter(); w.writeUInt8(this.isError ? 1 : 0); w.writeOptionalString(this.message); return w.getBuffer(); }
    static getId() { return 1570555748; }
}

export class RequestChangePasswordForm extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId(): number { return -1507635228; }
}

export class ChangePasswordForm extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId(): number { return 600420685; }
}

export class CreatePasswordForm extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId(): number { return 133238100; }
}

export class LinkEmailRequest extends BasePacket implements AuthTypes.ILinkEmailRequest {
    email: string | null = null;
    read(buffer: Buffer) { this.email = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.email).getBuffer(); }
    static getId() { return -20486732; }
}

export class LinkAccountResultSuccess extends BasePacket implements AuthTypes.ILinkAccountResultSuccess {
    identifier: string | null = null;
    constructor(identifier?: string | null) { super(); if (identifier) this.identifier = identifier; }
    read(buffer: Buffer) { this.identifier = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.identifier).getBuffer(); }
    static getId() { return 2098576423; }
}

export class LinkAccountResultError extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId(): number { return -541741971; }
}

export class LinkAccountFailedAccountInUse extends BasePacket implements AuthTypes.ILinkAccountFailedAccountInUse {
    method: string | null = null;
    constructor(method?: string | null) { super(); if (method) this.method = method; }
    read(buffer: Buffer) { this.method = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.method).getBuffer(); }
    static getId() { return -20513325; }
}