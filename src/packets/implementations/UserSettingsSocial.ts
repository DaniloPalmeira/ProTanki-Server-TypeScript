import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { ISocialLink, IUserSettingsSocial } from "../interfaces/IUserSettingsSocial";

export default class UserSettingsSocial extends BasePacket implements IUserSettingsSocial {
  passwordCreated: boolean = false;
  socialLinks: ISocialLink[] = [];

  constructor(passwordCreated?: boolean, socialLinks?: ISocialLink[]) {
    super();
    if (passwordCreated !== undefined) {
      this.passwordCreated = passwordCreated;
    }
    if (socialLinks) {
      this.socialLinks = socialLinks;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.passwordCreated = reader.readUInt8() === 1;
    const count = reader.readInt32BE();
    this.socialLinks = [];
    for (let i = 0; i < count; i++) {
      this.socialLinks.push({
        authorizationUrl: reader.readOptionalString() ?? "",
        isLinked: reader.readUInt8() === 1,
        snId: reader.readOptionalString() ?? "",
      });
    }
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
    const linksStr = this.socialLinks.map((l) => `{id: ${l.snId}, linked: ${l.isLinked}}`).join(", ");
    return `UserSettingsSocial(passwordCreated=${this.passwordCreated}, socialLinks=[${linksStr}])`;
  }

  static getId(): number {
    return -583564465;
  }
}
