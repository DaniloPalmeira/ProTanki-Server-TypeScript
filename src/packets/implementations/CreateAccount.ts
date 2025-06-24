import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ICreateAccount } from "../interfaces/ICreateAccount";
import { BasePacket } from "./BasePacket";
import SystemMessage from "./SystemMessage";
import logger from "../../utils/Logger";
import { UserService } from "../../services/UserService";
import NicknameUnavailable from "./NicknameUnavailable";
import { ValidationUtils } from "../../utils/ValidationUtils";
import InvalidNickname from "./InvalidNickname";

export default class CreateAccount extends BasePacket implements ICreateAccount {
  nickname?: string;
  password?: string;
  rememberMe: boolean = false;

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const nickLength = buffer.readInt32BE(offset);
      offset += 4;
      this.nickname = buffer.toString("utf-8", offset, offset + nickLength);
      offset += nickLength;
    }

    isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const passLength = buffer.readInt32BE(offset);
      offset += 4;
      this.password = buffer.toString("utf-8", offset, offset + passLength);
      offset += passLength;
    }

    this.rememberMe = buffer.readInt8(offset) === 1;
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    if (!this.nickname || !this.password || this.nickname.length < 3 || this.password.length < 3) {
      client.sendPacket(new SystemMessage("Apelido ou senha inválidos."));
      return;
    }

    if (ValidationUtils.isNicknameInappropriate(this.nickname)) {
      client.sendPacket(new InvalidNickname());
      return;
    }

    try {
      await UserService.createUser({
        username: this.nickname,
        password: this.password,
      });

      logger.info(`Account created successfully for ${this.nickname}`, {
        client: client.getRemoteAddress(),
      });

      client.sendPacket(new SystemMessage("Conta criada com sucesso!\nVocê já pode fazer o login."));
    } catch (error: any) {
      logger.warn(`Failed to create account for ${this.nickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });

      if (error.message.includes("already exists")) {
        const suggestions = await UserService.generateUsernameSuggestions(this.nickname);
        client.sendPacket(new NicknameUnavailable(suggestions));
      } else {
        client.sendPacket(new SystemMessage("Ocorreu um erro ao criar a conta.\nTente novamente."));
      }
    }
  }

  toString(): string {
    return `CreateAccount(nickname=${this.nickname}, password=${"*".repeat(this.password?.length || 0)}, rememberMe=${this.rememberMe})`;
  }

  static getId(): number {
    return 427083290;
  }
}
