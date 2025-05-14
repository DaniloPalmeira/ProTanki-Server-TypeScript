import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IInviteCode } from "../interfaces/IInviteCode";
import { BasePacket } from "./BasePacket";
import InviteCodeInvalid from "./InviteCodeInvalid";
import InviteCodeLogin from "./InviteCodeLogin";
import InviteCodeRegister from "./InviteCodeRegister";

export default class InviteCode extends BasePacket implements IInviteCode {
  inviteCode: string;

  constructor(inviteCode: string = "") {
    super();
    this.inviteCode = inviteCode;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.inviteCode = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.inviteCode = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.inviteCode.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.inviteCode, "utf8");
    const buffer = Buffer.alloc(5 + stringBuffer.length);
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    server.validateInviteCode(this.inviteCode, (result) => {
      if (!result.isValid) {
        client.sendPacket(new InviteCodeInvalid());
        return;
      }

      if (result.nickname) {
        client.sendPacket(new InviteCodeLogin(result.nickname));
        return;
      }

      client.sendPacket(new InviteCodeRegister());
    });
  }

  toString(): string {
    return `InviteCode(inviteCode=${this.inviteCode})`;
  }

  getId(): number {
    return 509394385;
  }
}
