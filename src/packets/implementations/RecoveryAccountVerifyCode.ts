import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BasePacket } from "./BasePacket";
import RecoveryEmailSent from "./RecoveryEmailSent";
import RecoveryEmailNotExists from "./RecoveryEmailNotExists";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";
import { IRecoveryAccountVerifyCode } from "../interfaces/IRecoveryAccountVerifyCode";
import RecoveryEmailInvalidCode from "./RecoveryEmailInvalidCode";

export default class RecoveryAccountVerifyCode
  extends BasePacket
  implements IRecoveryAccountVerifyCode
{
  code: string;

  constructor(code: string = "") {
    super();
    this.code = code;
  }

  read(buffer: Buffer): void {
    let position = 0;

    const isEmpty = buffer.readInt8(position) === 1;
    position += 1;
    if (isEmpty) {
      this.code = "";
      return;
    }
    const length = buffer.readInt32BE(position);
    position += 4;
    this.code = buffer.toString("utf8", position, position + length);
  }

  write(): Buffer {
    if (this.code.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.code, "utf8");
    const buffer = Buffer.alloc(5 + stringBuffer.length);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    if (client.recoveryCode === this.code){
      // abrir tela de troca de senha;
      return;
    }
    client.sendPacket(new RecoveryEmailInvalidCode())
  }

  toString(): string {
    return `RecoveryAccountVerifyCode(code=${this.code})`;
  }

  getId(): number {
    return 903498755;
  }
}
