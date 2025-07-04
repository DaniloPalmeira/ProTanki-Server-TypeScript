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
import { ConfigService } from "../services/ConfigService";
import { UserService } from "../services/UserService";
import { ChatService } from "../services/ChatService";
import { CommandService } from "../commands/CommandService";
import { PacketHandlerService } from "../handlers/PacketHandlerService";
import { PacketService } from "../packets/PacketService";
import { ShopService } from "../services/ShopService";
import { RankService } from "../services/RankService";
import { QuestService } from "../services/QuestService";
import { BattleService } from "../services/BattleService";
import OnlineNotifierData from "../packets/implementations/OnlineNotifierData";
import { GarageService } from "../services/GarageService";

export interface IServerServices {
  configService: ConfigService;
  userService: UserService;
  inviteService: InviteService;
  chatService: ChatService;
  commandService: CommandService;
  packetHandlerService: PacketHandlerService;
  packetService: PacketService;
  shopService: ShopService;
  rankService: RankService;
  questService: QuestService;
  garageService: GarageService;
}

export class ProTankiServer {
  private server: net.Server;
  private clientManager: ClientManager;
  private port: number;
  private maxClients: number;
  private needInviteCode: boolean;
  private socialNetworks: Array<string[]>;
  private loginForm: IRegistrationForm;

  private dynamicCallbacks: Map<number, (client: ProTankiClient) => void> = new Map();
  private nextCallbackId: number = 1000;

  public readonly configService: ConfigService;
  public readonly userService: UserService;
  public readonly inviteService: InviteService;
  public readonly chatService: ChatService;
  public readonly commandService: CommandService;
  public readonly packetHandlerService: PacketHandlerService;
  public readonly packetService: PacketService;
  public readonly shopService: ShopService;
  public readonly rankService: RankService;
  public readonly questService: QuestService;
  public get battleService(): BattleService {
    return this._getBattleService();
  }
  public readonly garageService: GarageService;

  private _getBattleService: () => BattleService;

  constructor(options: IServerOptions, getBattleService: () => BattleService, services: IServerServices) {
    this.validateOptions(options);
    this.port = options.port;
    this.maxClients = options.maxClients;
    this.needInviteCode = options.needInviteCode;
    this.socialNetworks = options.socialNetworks;
    this.loginForm = options.loginForm;

    this._getBattleService = getBattleService;
    this.configService = services.configService;
    this.userService = services.userService;
    this.inviteService = services.inviteService;
    this.chatService = services.chatService;
    this.commandService = services.commandService;
    this.packetHandlerService = services.packetHandlerService;
    this.packetService = services.packetService;
    this.shopService = services.shopService;
    this.rankService = services.rankService;
    this.questService = services.questService;
    this.garageService = services.garageService;

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
      throw new Error("Missing required server options: loginForm or socialNetworks");
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

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          logger.error("Error stopping ProTanki Server", { error: err });
          return reject(err);
        }
        this.clientManager.getClients().forEach((client) => client.closeConnection());
        resolve();
      });
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

  public getClients(): ProTankiClient[] {
    return this.clientManager.getClients();
  }

  public findClientByIp(ip: string): ProTankiClient | undefined {
    return this.clientManager.findClientByIp(ip);
  }

  public findClientByUsername(username: string): ProTankiClient | undefined {
    return this.clientManager.findClientByUsername(username);
  }

  public getNeedInviteCode(): boolean {
    return this.needInviteCode;
  }

  public getSocialNetworks(): Array<string[]> {
    return this.socialNetworks;
  }

  public getLoginForm(): IRegistrationForm {
    return this.loginForm;
  }

  public async validateInviteCode(code: string): Promise<IInviteResponse> {
    try {
      return await this.inviteService.validateInviteCode(code);
    } catch (error) {
      logger.error(`Error validating invite code ${code}`, { error });
      throw error;
    }
  }

  public broadcastToAll(packet: IPacket): void {
    this.clientManager.getClients().forEach((client) => client.sendPacket(packet));
  }

  public broadcastToLobbyChat(packet: IPacket): void {
    this.clientManager.sendToLobbyChatListeners(packet);
  }

  public broadcastToBattleList(packet: IPacket): void {
    this.clientManager.sendToBattleListWatchers(packet);
  }

  public notifySubscribersOfStatusChange(username: string, isOnline: boolean, serverNumber: number = 1): void {
    const lowerCaseUsername = username.toLowerCase();

    this.clientManager.getClients().forEach((client) => {
      if (client.subscriptions.has(lowerCaseUsername)) {
        logger.info(`Notifying ${client.user?.username} about status change for ${username}`);
        client.sendPacket(new OnlineNotifierData(isOnline, serverNumber, username));
      }
    });
  }

  public registerDynamicCallback(callback: (client: ProTankiClient) => void): number {
    const id = this.nextCallbackId++;
    this.dynamicCallbacks.set(id, callback);
    return id;
  }

  public executeDynamicCallback(id: number, client: ProTankiClient): boolean {
    const cb = this.dynamicCallbacks.get(id);
    if (cb) {
      cb(client);
      return true;
    }
    return false;
  }

  public removeDynamicCallback(id: number): void {
    this.dynamicCallbacks.delete(id);
  }
}
