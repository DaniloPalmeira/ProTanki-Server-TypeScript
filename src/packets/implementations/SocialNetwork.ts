import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ISocialNetwork } from "../interfaces/ISocialNetwork";
import { BasePacket } from "./BasePacket";

export default class SocialNetwork extends BasePacket implements ISocialNetwork {
  socialNetworkParams: Array<Array<String>>;

  constructor(socialNetworkParams: Array<Array<String>>) {
    super();
    this.socialNetworkParams = socialNetworkParams;
  }

  read(buffer: Buffer): void {
    const socialNetworkParams: Array<Array<String>> = [];
    const socialNetworkParamsLength = buffer.readInt32BE(0);

    let position = 4;
    for (let i = 0; i < socialNetworkParamsLength; i++) {
      const button: Array<String> = [];
      for (let j = 0; j < 2; j++) {
        const isEmpty = buffer.readInt8(position);
        position += 1;
        if (isEmpty === 0) {
          const length = buffer.readInt32BE(position);
          position += 4;
          button.push(buffer.toString("utf-8", position, position + length));
          position += length;
        } else {
          button.push("");
        }
      }
      socialNetworkParams.push(button);
    }
    this.socialNetworkParams = socialNetworkParams;
  }

  write(): Buffer {
    let totalSize = 4;
    for (const button of this.socialNetworkParams) {
      for (const val of button) {
        if (val.length === 0) {
          totalSize += 1;
        } else {
          totalSize += 1 + 4 + Buffer.byteLength(String(val), "utf8");
        }
      }
    }

    const packet = Buffer.alloc(totalSize);
    let offset = 0;

    offset = packet.writeInt32BE(this.socialNetworkParams.length, offset);

    for (const button of this.socialNetworkParams) {
      for (const val of button) {
        const isEmpty = val.length === 0;
        offset = packet.writeUInt8(isEmpty ? 1 : 0, offset);
        if (!isEmpty) {
          const valBuffer = Buffer.from(String(val), "utf8");
          offset = packet.writeInt32BE(valBuffer.length, offset);
          valBuffer.copy(packet, offset);
          offset += valBuffer.length;
        }
      }
    }
    return packet;
  }

  toString(): string {
    return `SocialNetwork(socialNetworkParams=${this.socialNetworkParams})`;
  }

  static getId(): number {
    return -1715719586;
  }
}
