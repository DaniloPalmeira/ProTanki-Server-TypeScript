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

  private writeStringArray(array: string[]): Buffer {
    let bufferParts: Buffer[] = [];

    const isEmpty = array.length === 0;
    bufferParts.push(Buffer.from([isEmpty ? 1 : 0]));

    if (!isEmpty) {
      const countBuffer = Buffer.alloc(4);
      countBuffer.writeInt32BE(array.length);
      bufferParts.push(countBuffer);

      for (const item of array) {
        const itemBuff = Buffer.from(item, "utf8");
        const itemHeader = Buffer.alloc(5);
        itemHeader.writeInt8(0, 0); // not empty
        itemHeader.writeInt32BE(itemBuff.length, 1);
        bufferParts.push(itemHeader, itemBuff);
      }
    }

    return Buffer.concat(bufferParts);
  }

  write(): Buffer {
    const acceptedBuff = this.writeStringArray(this.acceptedFriends);
    const newAcceptedBuff = this.writeStringArray(this.newAcceptedFriends);
    const incomingBuff = this.writeStringArray(this.incomingRequests);
    const newIncomingBuff = this.writeStringArray(this.newIncomingRequests);
    const outgoingBuff = this.writeStringArray(this.outgoingRequests);

    return Buffer.concat([acceptedBuff, newAcceptedBuff, incomingBuff, newIncomingBuff, outgoingBuff]);
  }

  toString(): string {
    return `FriendsList(accepted: ${this.acceptedFriends.length}, incoming: ${this.incomingRequests.length})`;
  }

  getId(): number {
    return 1422563374;
  }
}
