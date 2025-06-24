import { IFriendsList, IFriendsListProps } from "../interfaces/IFriendsList";
import { BasePacket } from "./BasePacket";

export default class FriendsList extends BasePacket implements IFriendsList {
  acceptedFriends: string[];
  newAcceptedFriends: string[];
  incomingRequests: string[];
  newIncomingRequests: string[];
  outgoingRequests: string[];

  constructor(data: IFriendsListProps) {
    super();
    this.acceptedFriends = data.acceptedFriends;
    this.newAcceptedFriends = data.newAcceptedFriends;
    this.incomingRequests = data.incomingRequests;
    this.newIncomingRequests = data.newIncomingRequests;
    this.outgoingRequests = data.outgoingRequests;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  private getStringArraySize(array: string[]): number {
    if (!array || array.length === 0) return 1;

    let size = 1 + 4;
    for (const item of array) {
      size += 1 + 4 + Buffer.byteLength(item, "utf8");
    }
    return size;
  }

  private writeStringArrayToBuffer(buffer: Buffer, offset: number, array: string[]): number {
    const isEmpty = !array || array.length === 0;
    offset = buffer.writeUInt8(isEmpty ? 1 : 0, offset);

    if (!isEmpty) {
      offset = buffer.writeInt32BE(array.length, offset);
      for (const item of array) {
        offset = buffer.writeUInt8(0, offset);
        const itemBuff = Buffer.from(item, "utf8");
        offset = buffer.writeInt32BE(itemBuff.length, offset);
        itemBuff.copy(buffer, offset);
        offset += itemBuff.length;
      }
    }
    return offset;
  }

  write(): Buffer {
    let totalSize = 0;
    totalSize += this.getStringArraySize(this.acceptedFriends);
    totalSize += this.getStringArraySize(this.newAcceptedFriends);
    totalSize += this.getStringArraySize(this.incomingRequests);
    totalSize += this.getStringArraySize(this.newIncomingRequests);
    totalSize += this.getStringArraySize(this.outgoingRequests);

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = this.writeStringArrayToBuffer(packet, offset, this.acceptedFriends);
    offset = this.writeStringArrayToBuffer(packet, offset, this.newAcceptedFriends);
    offset = this.writeStringArrayToBuffer(packet, offset, this.incomingRequests);
    offset = this.writeStringArrayToBuffer(packet, offset, this.newIncomingRequests);
    offset = this.writeStringArrayToBuffer(packet, offset, this.outgoingRequests);

    return packet;
  }

  toString(): string {
    return `FriendsList(accepted: ${this.acceptedFriends.length}, incoming: ${this.incomingRequests.length})`;
  }

  static getId(): number {
    return 1422563374;
  }
}
