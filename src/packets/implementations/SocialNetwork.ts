import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ISocialNetwork } from "../interfaces/ISocialNetwork";

export default class SocialNetwork implements ISocialNetwork {
  socialNetworkParams: Array<Array<String>>;

  constructor(socialNetworkParams: Array<Array<String>>) {
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
    let packet = Buffer.alloc(4);
    packet.writeInt32BE(this.socialNetworkParams.length, 0);

    this.socialNetworkParams.forEach((button) => {
      button.forEach((val, index) => {
        let packet1 = Buffer.alloc(1);
        const isEmpty = val.length === 0 ? 1 : 0;
        packet1.writeInt8(isEmpty, 0);
        if (isEmpty === 0) {
          const tempPacket = Buffer.alloc(4);
          tempPacket.writeInt32BE(val.length, 0);
          packet1 = Buffer.concat([packet1, tempPacket, Buffer.from(val)]);
        }
        packet = Buffer.concat([packet, packet1]);
      });
    });
    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `SocialNetwork(socialNetworkParams: ${this.socialNetworkParams})`;
  }

  getId(): number {
    return -1715719586;
  }
}
