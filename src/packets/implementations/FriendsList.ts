import { BufferWriter } from "../../utils/buffer/BufferWriter";
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

  write(): Buffer {
    const writer = new BufferWriter();
    writer.writeStringArray(this.acceptedFriends);
    writer.writeStringArray(this.newAcceptedFriends);
    writer.writeStringArray(this.incomingRequests);
    writer.writeStringArray(this.newIncomingRequests);
    writer.writeStringArray(this.outgoingRequests);
    return writer.getBuffer();
  }

  toString(): string {
    return `FriendsList(accepted: ${this.acceptedFriends.length}, incoming: ${this.incomingRequests.length})`;
  }

  static getId(): number {
    return 1422563374;
  }
}
