import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRequestLobby } from "../interfaces/IRequestLobby";
import { BasePacket } from "./BasePacket";

export default class RequestLobbyPacket extends BasePacket implements IRequestLobby {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "RequestLobbyPacket()";
  }

  static getId(): number {
    return 1452181070;
  }
}
