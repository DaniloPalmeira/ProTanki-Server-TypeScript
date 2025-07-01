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
    throw new Error("Method not implemented.");
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
    return `UserConnectDMPacket(nickname=${this.nickname}, usersCount=${this.usersInfo.length})`;
  }

  public static getId(): number {
    return 862913394;
  }
}
