import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IUnloadLobbyChat } from "../interfaces/IUnloadLobbyChat";
import { BasePacket } from "./BasePacket";

export default class UnloadLobbyChatPacket extends BasePacket implements IUnloadLobbyChat {
  read(buffer: Buffer): void {}

  write(): Buffer {
    return new BufferWriter().getBuffer();
  }

  toString(): string {
    return "UnloadLobbyChatPacket()";
  }

  static getId(): number {
    return -920985123;
  }
}
