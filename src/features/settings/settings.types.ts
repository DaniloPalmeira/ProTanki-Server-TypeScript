import { IEmpty } from "@/packets/interfaces/IEmpty";
import { IPacket } from "@/packets/interfaces/IPacket";

export interface IRequestSettings extends IEmpty { }

export interface ISocialLink {
    snId: string;
    authorizationUrl: string;
    isLinked: boolean;
}

export interface IUserSettingsSocial extends IPacket {
    passwordCreated: boolean;
    socialLinks: ISocialLink[];
}

export interface IUserSettingsNotifications extends IPacket {
    notificationsEnabled: boolean;
}

export interface ISetNotifications extends IPacket {
    enabled: boolean;
}

export interface IUpdatePassword extends IPacket {
    password: string | null;
    email: string | null;
}

export interface IUpdatePasswordResult extends IPacket {
    isError: boolean;
    message: string | null;
}

export interface IRequestChangePasswordForm extends IEmpty { }
export interface IChangePasswordForm extends IEmpty { }
export interface ICreatePasswordForm extends IEmpty { }

export interface ILinkEmailRequest extends IPacket {
    email: string | null;
}

export interface ILinkAccountResultSuccess extends IPacket {
    identifier: string | null;
}

export interface ILinkAccountResultError extends IEmpty { }

export interface ILinkAccountFailedAccountInUse extends IPacket {
    method: string | null;
}