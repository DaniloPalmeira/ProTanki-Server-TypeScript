import net from "net";
import { ClientManager } from "./ClientManager";
import { ProTankiClient } from "./ProTankiClient";
import { IPacket } from "../packets/interfaces/IPacket";
import { IServerOptions } from "../types/IServerOptions";
import { IRegistrationForm } from "../types/IRegistrationForm";
import { IInviteResponse } from "../types/IInviteResponse";
import { InviteService } from "../services/InviteService";
import { DEFAULT_MAX_CLIENTS, DEFAULT_PORT } from "../config/constants";
import logger from "../utils/Logger";

export class ProTankiServer {
  private server: net.Server;
  private clientManager: ClientManager;
  private port: number;
  private maxClients: number;
  private needInviteCode: boolean;
  private socialNetworks: Array<string[]>;
  private loginForm: IRegistrationForm;

  constructor(options: IServerOptions) {
    this.validateOptions(options);
    this.port = options.port;
    this.maxClients = options.maxClients;
    this.needInviteCode = options.needInviteCode;
    this.socialNetworks = options.socialNetworks;
    this.loginForm = options.loginForm;
    this.server = net.createServer(this.handleConnection.bind(this));
    this.clientManager = new ClientManager();
  }

  private validateOptions(options: IServerOptions): void {
    if (!options.port || options.port <= 0) {
      options.port = DEFAULT_PORT;
    }
    if (!options.maxClients || options.maxClients < 0) {
      options.maxClients = DEFAULT_MAX_CLIENTS;
    }
    if (!options.loginForm || !options.socialNetworks) {
      throw new Error(
        "Missing required server options: loginForm or socialNetworks"
      );
    }
  }

  public start(): void {
    this.server.listen(this.port, () => {
      logger.info(`ProTanki Server started`, {
        port: this.port,
        maxClients: this.maxClients,
      });
    });

    this.server.on("error", (err) => {
      logger.error("Server error", { error: err });
    });
  }

  public stop(callback: (error?: Error) => void): void {
    this.server.close((err) => {
      if (err) {
        logger.error("Error stopping ProTanki Server", { error: err });
        return callback(err);
      }
      this.clientManager
        .getClients()
        .forEach((client) => client.closeConnection());
      logger.info("ProTanki Server stopped");
      callback();
    });
  }

  public addClient(client: ProTankiClient): void {
    this.clientManager.addClient(client);
  }

  public removeClient(client: ProTankiClient): void {
    this.clientManager.removeClient(client);
  }

  private handleConnection(socket: net.Socket): void {
    if (this.clientManager.getClientCount() >= this.maxClients) {
      logger.warn(`Connection rejected: server at max capacity`, {
        maxClients: this.maxClients,
        client: socket.remoteAddress,
      });
      socket.write("Server is full. Try again later.\n");
      socket.end();
      return;
    }

    logger.info(`New client connected`, {
      client: socket.remoteAddress || "unknown",
    });
    new ProTankiClient({ socket, server: this });
  }

  public getNeedInviteCode(): boolean {
    return this.needInviteCode;
  }

  public updateNeedInviteCode(value: boolean): void {
    this.needInviteCode = value;
    logger.info("Updated needInviteCode", {
      needInviteCode: this.needInviteCode,
    });
  }

  public updateMaxClients(value: number): void {
    if (value < 0) {
      logger.warn("Attempt to set maxClients to invalid value", { value });
      return;
    }
    this.maxClients = value;
    logger.info("Updated maxClients", { maxClients: this.maxClients });
  }

  public getSocialNetworks(): Array<string[]> {
    return this.socialNetworks;
  }

  public getLoginForm(): IRegistrationForm {
    return this.loginForm;
  }

  public validateInviteCode(
    code: string,
    callback: (response: IInviteResponse) => void
  ): void {
    InviteService.validateInviteCode(code, (error, response) => {
      if (error) {
        logger.error(`Error validating invite code ${code}`, { error });
        return callback({ isValid: false });
      }
      callback(response!);
    });
  }

  public broadcastToLobby(packet: IPacket): void {
    this.clientManager.sendToLobbyClients(packet);
  }
}
