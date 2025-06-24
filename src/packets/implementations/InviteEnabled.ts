import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IInviteEnabled } from "../interfaces/IInviteEnabled";
import { BasePacket } from "./BasePacket";

export default class InviteEnabled
  extends BasePacket
  implements IInviteEnabled
{
  requireInviteCode: boolean;

  constructor(requireInviteCode: boolean = false) {
    super();
    this.requireInviteCode = requireInviteCode;
  }

  read(buffer: Buffer): void {
    this.requireInviteCode = buffer.readInt8(0) === 1;
  }

  write(): Buffer {
    const packet = Buffer.alloc(1);
    packet.writeInt8(this.requireInviteCode ? 1 : 0, 0);

    return packet;
  }

  toString(): string {
    return `InviteEnabled(requireInviteCode=${this.requireInviteCode})`;
  }

  static getId(): number {
    return 444933603;
  }
}
