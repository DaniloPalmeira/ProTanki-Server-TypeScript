import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IRecoveryAccountSendCode } from "../interfaces/IRecoveryAccountSendCode";
import { BasePacket } from "./BasePacket";
import RecoveryEmailSent from "./RecoveryEmailSent";
import RecoveryEmailNotExists from "./RecoveryEmailNotExists";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";

export default class RecoveryAccountSendCode extends BasePacket implements IRecoveryAccountSendCode {
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
    buffer.writeInt8(0, 0);
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    logger.info(`Recovery code requested for email: ${this.email}`, {
      client: client.getRemoteAddress(),
    });

    try {
      const user = await UserService.findUserByEmail(this.email);
      if (user) {
        logger.info(`Recovery email sent to: ${this.email}`);
        client.recoveryEmail = this.email;
        client.recoveryCode = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        client.sendPacket(new RecoveryEmailSent());
      } else {
        logger.info(`Email not found: ${this.email}`);
        client.sendPacket(new RecoveryEmailNotExists());
      }
    } catch (error) {
      logger.error(`Error checking email ${this.email}`, { error });
      client.sendPacket(new RecoveryEmailNotExists());
    }
  }

  toString(): string {
    return `RecoveryAccountSendCode(email=${this.email})`;
  }

  getId(): number {
    return 1744584433;
  }
}
