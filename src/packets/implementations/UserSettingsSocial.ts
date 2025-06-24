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

  private writeOptionalStringToBuffer(buffer: Buffer, offset: number, value: string | null): number {
    const isEmpty = !value;
    offset = buffer.writeUInt8(isEmpty ? 1 : 0, offset);
    if (!isEmpty) {
      const valueBuffer = Buffer.from(value!, "utf8");
      offset = buffer.writeInt32BE(valueBuffer.length, offset);
      valueBuffer.copy(buffer, offset);
      offset += valueBuffer.length;
    }
    return offset;
  }

  write(): Buffer {
    let totalSize = 1 + 4; // passwordCreated + quantity
    for (const link of this.socialLinks) {
      totalSize += 1; // isEmpty check for authorizationUrl
      if (link.authorizationUrl) {
        totalSize += 4 + Buffer.byteLength(link.authorizationUrl, "utf8");
      }
      totalSize += 1; // linkExists
      totalSize += 1; // isEmpty check for snId
      if (link.snId) {
        totalSize += 4 + Buffer.byteLength(link.snId, "utf8");
      }
    }

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeUInt8(this.passwordCreated ? 1 : 0, offset);
    offset = packet.writeInt32BE(this.socialLinks.length, offset);

    for (const link of this.socialLinks) {
      offset = this.writeOptionalStringToBuffer(packet, offset, link.authorizationUrl);
      offset = packet.writeUInt8(link.isLinked ? 1 : 0, offset);
      offset = this.writeOptionalStringToBuffer(packet, offset, link.snId);
    }

    return packet;
  }

  toString(): string {
    return `UserSettingsSocial(passwordCreated=${this.passwordCreated}, socialLinks=${this.socialLinks.length})`;
  }

  static getId(): number {
    return -583564465;
  }
}
