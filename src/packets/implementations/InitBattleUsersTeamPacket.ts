import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IBattleUser } from "../interfaces/IBattleUser";
import { IInitBattleUsersTeam } from "../interfaces/IInitBattleUsers";
import { BasePacket } from "./BasePacket";

export default class InitBattleUsersTeamPacket extends BasePacket implements IInitBattleUsersTeam {
  scoreBlue: number;
  scoreRed: number;
  usersBlue: IBattleUser[];
  usersRed: IBattleUser[];

  constructor(scoreBlue: number = 0, scoreRed: number = 0, usersBlue: IBattleUser[] = [], usersRed: IBattleUser[] = []) {
    super();
    this.scoreBlue = scoreBlue;
    this.scoreRed = scoreRed;
    this.usersBlue = usersBlue;
    this.usersRed = usersRed;
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
    this.scoreBlue = reader.readInt32BE();
    this.scoreRed = reader.readInt32BE();
    this.usersBlue = this.readUsers(reader);
    this.usersRed = this.readUsers(reader);
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeInt32BE(this.scoreBlue);
    writer.writeInt32BE(this.scoreRed);
    this.writeUsers(writer, this.usersBlue);
    this.writeUsers(writer, this.usersRed);
    return writer.getBuffer();
  }

  toString(): string {
    return `InitBattleUsersTeamPacket(scoreBlue=${this.scoreBlue}, scoreRed=${this.scoreRed}, usersBlue=${JSON.stringify(this.usersBlue)}, usersRed=${JSON.stringify(this.usersRed)})`;
  }

  static getId(): number {
    return -1233891872;
  }
}
