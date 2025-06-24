import { IUpdatePassword } from "../interfaces/IUpdatePassword";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BasePacket } from "./BasePacket";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";
import UpdatePasswordResult from "./UpdatePasswordResult";

export default class UpdatePassword extends BasePacket implements IUpdatePassword {
  password?: string;
  email?: string;

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const passLength = buffer.readInt32BE(offset);
      offset += 4;
      this.password = buffer.toString("utf-8", offset, offset + passLength);
      offset += passLength;
    }

    isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const emailLength = buffer.readInt32BE(offset);
      offset += 4;
      this.email = buffer.toString("utf-8", offset, offset + emailLength);
      offset += emailLength;
    }
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    const originalEmail = client.recoveryEmail;

    if (!originalEmail || !this.password || !this.email) {
      client.sendPacket(new UpdatePasswordResult(true, "Dados inválidos."));
      return;
    }

    try {
      await UserService.updatePasswordByEmail(originalEmail, this.password, this.email);

      logger.info(`Password updated for user with original email ${originalEmail}`, {
        client: client.getRemoteAddress(),
        newEmail: this.email,
      });

      client.sendPacket(new UpdatePasswordResult(false, "Sua senha foi alterada com sucesso."));
    } catch (error: any) {
      logger.error(`Failed to update password for ${originalEmail}`, { error: error.message });

      if (error.message.includes("is already in use")) {
        client.sendPacket(new UpdatePasswordResult(true, "O e-mail fornecido já está em uso por outra conta."));
      } else {
        client.sendPacket(new UpdatePasswordResult(true, "Ocorreu um erro ao atualizar sua senha."));
      }
    }
  }

  static getId(): number {
    return 762959326;
  }
}
