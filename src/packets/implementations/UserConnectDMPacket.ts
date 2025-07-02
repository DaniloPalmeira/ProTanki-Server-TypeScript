import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleUserInfo, IUserConnectDM } from "../interfaces/IUserConnectDM";
import { BasePacket } from "./BasePacket";

export default class UserConnectDMPacket extends BasePacket implements IUserConnectDM {
  nickname: string | null;
  usersInfo: IBattleUserInfo[];

  constructor(nickname: string | null, usersInfo: IBattleUserInfo[]) {
    super();
    this.nickname = nickname;
    this.usersInfo = usersInfo;
  }

  public read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    const count = reader.readInt32BE();
    this.usersInfo = [];
    for (let i = 0; i < count; i++) {
      this.usersInfo.push({
        ChatModeratorLevel: reader.readInt32BE(),
        deaths: reader.readInt32BE(),
        kills: reader.readInt32BE(),
        rank: reader.readUInt8(),
        score: reader.readInt32BE(),
        nickname: reader.readOptionalString(),
      });
    }
  }

  public write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeInt32BE(this.usersInfo.length);

    for (const user of this.usersInfo) {
      writer.writeInt32BE(user.ChatModeratorLevel);
      writer.writeInt32BE(user.deaths);
      writer.writeInt32BE(user.kills);
      writer.writeUInt8(user.rank);
      writer.writeInt32BE(user.score);
      writer.writeOptionalString(user.nickname);
    }

    return writer.getBuffer();
  }

  public toString(): string {
    return `UserConnectDMPacket(nickname=${this.nickname}, usersInfo=${JSON.stringify(this.usersInfo)})`;
  }

  public static getId(): number {
    return 862913394;
  }
}
