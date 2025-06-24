import { IChatHistory, IChatMessageData, IChatMessageUser } from "../interfaces/IChatHistory";
import { BasePacket } from "./BasePacket";

export default class ChatHistory extends BasePacket implements IChatHistory {
  messages: IChatMessageData[];

  constructor(messages: IChatMessageData[]) {
    super();
    this.messages = messages;
  }

  read(buffer: Buffer): void {
    throw new Error("Method not implemented.");
  }

  private writeOptionalString(value: string | null): Buffer {
    const isEmpty = !value;
    if (isEmpty) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(value!, "utf8");
    const header = Buffer.alloc(5);
    header.writeInt8(0, 0);
    header.writeInt32BE(stringBuffer.length, 1);
    return Buffer.concat([header, stringBuffer]);
  }

  private writeUser(user: IChatMessageUser | null): Buffer {
    const isEmpty = !user;
    if (isEmpty) {
      return Buffer.from([1]);
    }
    const buffer = Buffer.alloc(8);
    buffer.writeInt32BE(user!.moderatorLevel, 0);
    buffer.writeInt32BE(user!.rank, 4);

    const ipBuffer = this.writeOptionalString(user!.ip);
    const uidBuffer = this.writeOptionalString(user!.uid);

    return Buffer.concat([Buffer.from([0]), buffer, ipBuffer, uidBuffer]);
  }

  write(): Buffer {
    const countBuffer = Buffer.alloc(4);
    countBuffer.writeInt32BE(this.messages.length);

    const messageBuffers = this.messages.map((msg) => {
      const sourceBuffer = this.writeUser(msg.source);
      const targetBuffer = this.writeUser(msg.target);
      const messageBuffer = this.writeOptionalString(msg.message);
      const flags = Buffer.from([msg.isSystem ? 1 : 0, msg.isWarning ? 1 : 0]);
      return Buffer.concat([sourceBuffer, flags.subarray(0, 1), targetBuffer, messageBuffer, flags.subarray(1, 2)]);
    });

    return Buffer.concat([countBuffer, ...messageBuffers]);
  }

  toString(): string {
    return `ChatHistory(messages=${this.messages.length})`;
  }

  static getId(): number {
    return -1263520410;
  }
}
