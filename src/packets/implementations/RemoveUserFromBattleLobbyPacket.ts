import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRemoveUserFromBattleLobby, IRemoveUserFromBattleLobbyData } from "../interfaces/IRemoveUserFromBattleLobby";
import { BasePacket } from "./BasePacket";

export default class RemoveUserFromBattleLobbyPacket extends BasePacket implements IRemoveUserFromBattleLobby {
  battleId: string | null;
  nickname: string | null;

  constructor(data?: IRemoveUserFromBattleLobbyData) {
    super();
    this.battleId = data?.battleId ?? null;
    this.nickname = data?.nickname ?? null;
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.battleId = reader.readOptionalString();
    this.nickname = reader.readOptionalString();
  }

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeOptionalString(this.battleId);
    writer.writeOptionalString(this.nickname);
    return writer.getBuffer();
  }

  toString(): string {
    return `RemoveUserFromBattleLobbyPacket(battleId=${this.battleId}, nickname=${this.nickname})`;
  }

  static getId(): number {
    return 1924874982;
  }
}
