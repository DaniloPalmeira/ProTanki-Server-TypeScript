import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ILogin } from "../interfaces/ILogin";
import { BasePacket } from "./BasePacket";
import IncorrectPassword from "./IncorrectPassword";
import { UserService } from "../../services/UserService";
import logger from "../../utils/Logger";
import Punishment from "./Punishment";
import HideLoginForm from "./HideLoginForm";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";

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
      client.user = user;

      if (user.isPunished && user.punishmentExpiresAt && user.punishmentExpiresAt > new Date()) {
        const now = new Date();
        const timeLeftMs = user.punishmentExpiresAt.getTime() - now.getTime();

        const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

        client.sendPacket(new Punishment(user.punishmentReason, days, hours, minutes));
        logger.info(`Punished user ${user.username} attempted to login`, { client: client.getRemoteAddress() });
        return;
      }

      logger.info(`Successful login for user ${user.username}`, {
        client: client.getRemoteAddress(),
      });

      client.sendPacket(new HideLoginForm());
      await LobbyWorkflow.enterLobby(client, server);
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
