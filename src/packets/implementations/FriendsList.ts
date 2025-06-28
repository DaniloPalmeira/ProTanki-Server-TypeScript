import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IFriendsList, IFriendsListProps } from "../interfaces/IFriendsList";
import { BasePacket } from "./BasePacket";

export default class FriendsList extends BasePacket implements IFriendsList {
  acceptedFriends: string[] = [];
  newAcceptedFriends: string[] = [];
  incomingRequests: string[] = [];
  newIncomingRequests: string[] = [];
  outgoingRequests: string[] = [];

  constructor(data?: IFriendsListProps) {
    super();
    if (data) {
      this.acceptedFriends = data.acceptedFriends;
      this.newAcceptedFriends = data.newAcceptedFriends;
      this.incomingRequests = data.incomingRequests;
      this.newIncomingRequests = data.newIncomingRequests;
      this.outgoingRequests = data.outgoingRequests;
    }
  }

  read(buffer: Buffer): void {
    const reader = new BufferReader(buffer);
    this.acceptedFriends = reader.readStringArray();
    this.newAcceptedFriends = reader.readStringArray();
    this.incomingRequests = reader.readStringArray();
    this.newIncomingRequests = reader.readStringArray();
    this.outgoingRequests = reader.readStringArray();
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
    return `FriendsList(\n` + `  acceptedFriends=[${this.acceptedFriends.join(", ")}],\n` + `  newAcceptedFriends=[${this.newAcceptedFriends.join(", ")}],\n` + `  incomingRequests=[${this.incomingRequests.join(", ")}],\n` + `  newIncomingRequests=[${this.newIncomingRequests.join(", ")}],\n` + `  outgoingRequests=[${this.outgoingRequests.join(", ")}]\n` + `)`;
  }

  static getId(): number {
    return 1422563374;
  }
}
