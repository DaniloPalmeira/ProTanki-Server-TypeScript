import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IInviteEnabled } from "../interfaces/IInviteEnabled";

export default class InviteEnabled implements IInviteEnabled {
  requireInviteCode: boolean;

  constructor(requireInviteCode: boolean = false) {
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

  run(server: ProTankiServer, client: ProTankiClient): void {}

  toString(): string {
    return `InviteEnabled(requireInviteCode: ${this.requireInviteCode})`;
  }

  getId(): number {
    return 444933603;
  }
}
