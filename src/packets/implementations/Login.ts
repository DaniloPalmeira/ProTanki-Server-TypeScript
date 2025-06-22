import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ILogin } from "../interfaces/ILogin";
import { BasePacket } from "./BasePacket";
import SystemMessage from "./SystemMessage";
import IncorrectPassword from "./IncorrectPassword";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";

export default class Login extends BasePacket implements ILogin {
  username?: string;
  password?: string;
  rememberMe: boolean = false;

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const nickLength = buffer.readInt32BE(offset);
      offset += 4;
      this.username = buffer.toString("utf-8", offset, offset + nickLength);
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
    if (!this.username || !this.password) {
      client.sendPacket(new IncorrectPassword());
      return;
    }

    try {
      const user = await UserService.login(this.username, this.password, null);
      logger.info(`Successful login attempt for user ${user.username}`, {
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage("Login bem-sucedido!\nO lobby do jogo ainda não foi implementado."));
    } catch (error: any) {
      logger.warn(`Failed login attempt for username ${this.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new IncorrectPassword());
    }
  }

  toString(): string {
    return `Login(username=${this.username}, password=${"*".repeat(this.password?.length || 0)}, rememberMe=${this.rememberMe})`;
  }

  getId(): number {
    return -739684591;
  }
}
