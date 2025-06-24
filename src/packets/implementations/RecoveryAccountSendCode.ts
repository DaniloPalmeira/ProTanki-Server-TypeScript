import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IRecoveryAccountSendCode } from "../interfaces/IRecoveryAccountSendCode";
import { BasePacket } from "./BasePacket";
import RecoveryEmailSent from "./RecoveryEmailSent";
import RecoveryEmailNotExists from "./RecoveryEmailNotExists";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";
import crypto from "crypto";

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
    const packetSize = 1 + 4 + stringBuffer.length;
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
      const user = await server.userService.findUserByEmail(this.email);
      if (user) {
        const recoveryCode = crypto.randomBytes(16).toString("hex");

        logger.info(`Recovery email sent to: ${this.email}, code: ${recoveryCode}`);
        client.recoveryEmail = this.email;
        client.recoveryCode = recoveryCode;
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

  static getId(): number {
    return 1744584433;
  }
}
