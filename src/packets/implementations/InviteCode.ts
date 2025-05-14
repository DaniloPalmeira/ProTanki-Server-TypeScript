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
    const { value } = this.readString(buffer, 0);
    this.inviteCode = value;
  }

  write(): Buffer {
    return this.writeString(this.inviteCode);
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    server.validateInviteCode(this.inviteCode).then((result) => {
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
    return `InviteCode(inviteCode: ${this.inviteCode})`;
  }

  getId(): number {
    return 509394385;
  }
}
