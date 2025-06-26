import * as net from "net";
import { ProTankiServer } from "./ProTankiServer";
import { ClientState } from "../types/ClientState";
import { EncryptionService } from "../crypto/EncryptionService";
import { IClientOptions } from "../types/IClientOptions";
import { IPacket } from "../packets/interfaces/IPacket";
import Protection from "../packets/implementations/Protection";
import logger from "../utils/Logger";
import { UserDocument } from "../models/User";

interface PacketQueueItem {
  packetId: number;
  packetData: Buffer;
}

export class ProTankiClient {
  private static readonly HEADER_SIZE = 8;
  private socket: net.Socket;
  private server: ProTankiServer;
  private state: ClientState;
  private encryptionService: EncryptionService;
  private rawDataReceived: Buffer = Buffer.alloc(0);
  public language: string | null = null;
  public captchaSolution: string | null = null;
  public recoveryCode: string | null = null;
  public recoveryEmail: string | null = null;
  public user: UserDocument | null = null;
  public shopCountryCode: string = "BR";
  private packetQueue: PacketQueueItem[] = [];
  private isProcessingQueue: boolean = false;

  public isInFlowMode: boolean = false;
  public flowTarget: string | null = null;
  public flowPayloadHex: string | null = null;

  constructor({ socket, server }: IClientOptions) {
    this.socket = socket;
    this.server = server;
    this.state = "auth";
    this.encryptionService = new EncryptionService();
    this.setupSocket();
    this.server.addClient(this);
    this.sendPacket(new Protection(this.encryptionService.obtainKeys()), false);
  }

  public getState(): ClientState {
    return this.state;
  }

  public setState(newState: ClientState): void {
    this.state = newState;
  }

  public getRemoteAddress(): string {
    return this.socket.remoteAddress || "unknown";
  }

  private setupSocket(): void {
    this.socket.on("data", this.handleData.bind(this));
    this.socket.on("close", this.handleClose.bind(this));
    this.socket.on("error", (err) => {
      logger.error(`Socket error for client ${this.getRemoteAddress()}`, {
        error: err,
      });
      this.handleClose();
    });
  }

  private handleData(data: Buffer): void {
    if (!data || data.length === 0) {
      logger.warn("Received empty data", { client: this.getRemoteAddress() });
      return;
    }

    this.rawDataReceived = Buffer.concat([this.rawDataReceived, data]);

    while (this.rawDataReceived.length >= ProTankiClient.HEADER_SIZE) {
      const packetSize = this.rawDataReceived.readInt32BE(0);
      if (this.rawDataReceived.length < packetSize) {
        break;
      }

      if (packetSize < ProTankiClient.HEADER_SIZE) {
        logger.warn(`Invalid packet size: ${packetSize}`, {
          client: this.getRemoteAddress(),
        });
        this.closeConnection();
        return;
      }

      const packetId = this.rawDataReceived.readInt32BE(4);
      const packetData = this.rawDataReceived.slice(ProTankiClient.HEADER_SIZE, packetSize);

      this.packetQueue.push({ packetId, packetData });
      logger.debug(`Packet queued`, {
        id: packetId,
        size: packetSize,
        client: this.getRemoteAddress(),
      });

      this.rawDataReceived = this.rawDataReceived.slice(packetSize);
    }

    this.processPacketQueue();
  }

  private async processPacketQueue(): Promise<void> {
    if (this.isProcessingQueue || this.packetQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.packetQueue.length > 0) {
      const { packetId, packetData } = this.packetQueue.shift()!;

      logger.info(`Processing packet`, {
        id: packetId,
        client: this.getRemoteAddress(),
      });

      const decryptedPacket = this.encryptionService.decrypt(packetData);
      const packetInstance = this.server.packetService.createPacket(packetId);

      if (!packetInstance) {
        logger.warn(`No packet class found for ID: ${packetId}`, {
          client: this.getRemoteAddress(),
          packetHex: decryptedPacket.toString("hex"),
        });
        continue;
      }

      try {
        packetInstance.read(decryptedPacket);
        logger.info(`Packet processed: ${packetInstance.toString()}`, {
          client: this.getRemoteAddress(),
        });

        const handler = this.server.packetHandlerService.getHandler(packetId);

        if (handler) {
          await handler.execute(this, this.server, packetInstance);
        } else {
          logger.warn(`No handler implemented for packet ID: ${packetId}`);
        }
      } catch (error: any) {
        logger.error(`Error processing packet ID ${packetId}`, {
          error,
          client: this.getRemoteAddress(),
        });
        this.closeConnection();
        break;
      }
    }

    this.isProcessingQueue = false;
  }

  private handleClose(): void {
    logger.info(`Connection closed`, { client: this.getRemoteAddress() });
    this.server.removeClient(this);
    this.socket.destroy();
  }

  public closeConnection(): void {
    this.socket.end();
    this.handleClose();
  }

  public sendPacket(packet: IPacket, encrypt: boolean = true): void {
    try {
      const rawBuffer = packet.write();
      const packetId = packet.getId();
      const finalBuffer = encrypt ? this.encryptionService.encrypt(rawBuffer) : rawBuffer;
      const packetBuffer = this.buildPacketBuffer(packetId, finalBuffer);

      logger.debug(`Sending packet`, {
        string: packet.toString(),
        id: packetId,
        size: packetBuffer.length,
        encrypted: encrypt,
        client: this.getRemoteAddress(),
      });
      this.socket.write(packetBuffer);
    } catch (error) {
      logger.error(`Error sending packet to ${this.getRemoteAddress()}`, {
        error,
      });
    }
  }

  private buildPacketBuffer(packetId: number, data: Buffer): Buffer {
    const packetSize = data.length + ProTankiClient.HEADER_SIZE;
    const packetBuffer = Buffer.alloc(packetSize);
    packetBuffer.writeInt32BE(packetSize, 0);
    packetBuffer.writeInt32BE(packetId, 4);
    data.copy(packetBuffer, ProTankiClient.HEADER_SIZE);
    return packetBuffer;
  }
}
