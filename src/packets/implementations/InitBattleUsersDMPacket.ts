import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleUser } from "../interfaces/IBattleUser";
import { IInitBattleUsersDM } from "../interfaces/IInitBattleUsers";
import { BasePacket } from "./BasePacket";

export default class InitBattleUsersDMPacket extends BasePacket implements IInitBattleUsersDM {
  users: IBattleUser[] = [];

  constructor(users?: IBattleUser[]) {
    super();
    if (users) {
      this.users = users;
    }
  }

  private readUsers(reader: BufferReader): IBattleUser[] {
    const users: IBattleUser[] = [];
    const userCount = reader.readInt32BE();
    for (let i = 0; i < userCount; i++) {
      users.push({
        chatModeratorLevel: reader.readInt32BE(),
        deaths: reader.readInt32BE(),
        kills: reader.readInt32BE(),
        rank: reader.readInt8(),
        score: reader.readInt32BE(),
        uid: reader.readOptionalString(),
      });
    }
    return users;
  }

  private writeUsers(writer: BufferWriter, users: IBattleUser[]): void {
    writer.writeInt32BE(users.length);
    for (const user of users) {
      writer.writeInt32BE(user.chatModeratorLevel);
      writer.writeInt32BE(user.deaths);
      writer.writeInt32BE(user.kills);
      writer.writeInt8(user.rank);
      writer.writeInt32BE(user.score);
      writer.writeOptionalString(user.uid);
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.users = this.readUsers(reader);
  }

  write(): Buffer {
    const writer = new BufferWriter();
    this.writeUsers(writer, this.users);
    return writer.getBuffer();
  }

  toString(): string {
    return `InitBattleUsersDMPacket(users=${JSON.stringify(this.users)})`;
  }

  static getId(): number {
    return -1959138292;
  }
}
