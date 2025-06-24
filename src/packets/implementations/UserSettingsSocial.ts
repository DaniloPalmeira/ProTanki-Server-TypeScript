import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISocialLink, IUserSettingsSocial } from "../interfaces/IUserSettingsSocial";

export default class UserSettingsSocial extends BasePacket implements IUserSettingsSocial {
  passwordCreated: boolean;
  socialLinks: ISocialLink[];

  constructor(passwordCreated: boolean, socialLinks: ISocialLink[]) {
    super();
    this.passwordCreated = passwordCreated;
    this.socialLinks = socialLinks;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeUInt8(this.passwordCreated ? 1 : 0);
    writer.writeInt32BE(this.socialLinks.length);

    for (const link of this.socialLinks) {
      writer.writeOptionalString(link.authorizationUrl);
      writer.writeUInt8(link.isLinked ? 1 : 0);
      writer.writeOptionalString(link.snId);
    }

    return writer.getBuffer();
  }

  toString(): string {
    return `UserSettingsSocial(passwordCreated=${this.passwordCreated}, socialLinks=${this.socialLinks.length})`;
  }

  static getId(): number {
    return -583564465;
  }
}
