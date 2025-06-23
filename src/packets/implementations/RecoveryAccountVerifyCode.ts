import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BasePacket } from "./BasePacket";
import { IRecoveryAccountVerifyCode } from "../interfaces/IRecoveryAccountVerifyCode";
import RecoveryEmailInvalidCode from "./RecoveryEmailInvalidCode";
import GoToRecoveryPassword from "./GoToRecoveryPassword";

export default class RecoveryAccountVerifyCode extends BasePacket implements IRecoveryAccountVerifyCode {
  code: string;

  constructor(code: string = "") {
    super();
    this.code = code;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.code = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.code = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.code.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.code, "utf8");
    const packetSize = 5 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    if (client.recoveryCode && client.recoveryCode === this.code) {
      client.sendPacket(new GoToRecoveryPassword(client.recoveryEmail));
    } else {
      client.sendPacket(new RecoveryEmailInvalidCode());
    }
  }

  toString(): string {
    return `RecoveryAccountVerifyCode(code=${this.code})`;
  }

  getId(): number {
    return 903498755;
  }
}
