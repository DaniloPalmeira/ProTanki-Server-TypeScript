import { BasePacket } from "./BasePacket";
import { IDeclineAllFriendRequests } from "../interfaces/IDeclineAllFriendRequests";

export default class DeclineAllFriendRequests extends BasePacket implements IDeclineAllFriendRequests {
  read(buffer: Buffer): void {}

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  toString(): string {
    return `DeclineAllFriendRequests()`;
  }

  static getId(): number {
    return -1590185083;
  }
}
