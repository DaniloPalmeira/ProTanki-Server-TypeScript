import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { BasePacket } from "./BasePacket";
import { IBattleChatMessage, IBattleChatMessageData } from "../interfaces/IBattleChatMessage";

export default class BattleChatTeamMessagePacket extends BasePacket implements IBattleChatMessage {
  nickname: string | null;
  message: string | null;
  team: number;

  constructor(data?: IBattleChatMessageData) {
    super();
    this.nickname = data?.nickname ?? null;
    this.message = data?.message ?? null;
    this.team = data?.team ?? 2;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.nickname = reader.readOptionalString();
    this.message = reader.readOptionalString();
    this.team = reader.readInt32BE();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.nickname);
    writer.writeOptionalString(this.message);
    writer.writeInt32BE(this.team);
    return writer.getBuffer();
  }

  toString(): string {
    return `BattleChatTeamMessagePacket(nickname=${this.nickname}, message=${this.message}, team=${this.team})`;
  }

  static getId(): number {
    return -449356094;
  }
}
