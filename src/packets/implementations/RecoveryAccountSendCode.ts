import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IRecoveryAccountSendCode } from "../interfaces/IRecoveryAccountSendCode";
import { BasePacket } from "./BasePacket";
import RecoveryEmailSent from "./RecoveryEmailSent";
import RecoveryEmailNotExists from "./RecoveryEmailNotExists";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";

export default class RecoveryAccountSendCode
  extends BasePacket
  implements IRecoveryAccountSendCode
{
  email: string;

  constructor(email: string = "") {
    super();
    this.email = email;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    if (isEmpty) {
      this.email = "";
      return;
    }
    const length = buffer.readInt32BE(1);
    this.email = buffer.toString("utf8", 5, 5 + length);
  }

  write(): Buffer {
    if (this.email.length == 0) {
      return Buffer.from([1]);
    }
    const stringBuffer = Buffer.from(this.email, "utf8");
    const packetSize = 5 + stringBuffer.length;
    const buffer = Buffer.alloc(packetSize);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    logger.info(`Recovery code requested for email: ${this.email}`, {
      client: client.getRemoteAddress(),
    });

    // Verifica se o e-mail existe no banco de dados
    UserService.findUserByEmail(this.email, (error, user) => {
      if (error) {
        logger.error(`Error checking email ${this.email}`, { error });
        client.sendPacket(new RecoveryEmailNotExists());
        return;
      }

      if (user) {
        // E-mail existe, simular envio de código de recuperação
        logger.info(`Recovery email sent to: ${this.email}`);
        client.recoveryCode = "abcdefghijklmnopqrstuvwxyz";
        client.sendPacket(new RecoveryEmailSent());
      } else {
        // E-mail não encontrado
        logger.info(`Email not found: ${this.email}`);
        client.sendPacket(new RecoveryEmailNotExists());
      }
    });
  }

  toString(): string {
    return `RecoveryAccountSendCode(email=${this.email})`;
  }

  getId(): number {
    return 1744584433;
  }
}
