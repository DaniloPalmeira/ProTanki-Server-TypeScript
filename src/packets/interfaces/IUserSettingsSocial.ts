import { IPacket } from "./IPacket";

export interface ISocialLink {
  snId: string;
  authorizationUrl: string;
  isLinked: boolean;
}

export interface IUserSettingsSocial extends IPacket {
  passwordCreated: boolean;
  socialLinks: ISocialLink[];
}
