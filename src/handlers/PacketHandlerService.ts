import fs from "fs";
import path from "path";
import logger from "../utils/Logger";
import { IPacket } from "../packets/interfaces/IPacket";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { IPacketHandler } from "./IPacketHandler";

export class PacketHandlerService {
  private handlers = new Map<number, IPacketHandler<any>>();

  public constructor() {
    this.loadHandlers();
  }

  private loadHandlers(): void {
    const handlerDir = path.join(__dirname, "implementations");
    const files = fs.readdirSync(handlerDir).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    for (const file of files) {
      try {
        const module = require(path.join(handlerDir, file));
        const HandlerClass = module.default;

        if (HandlerClass && typeof HandlerClass === "function") {
          const handlerInstance: IPacketHandler<any> = new HandlerClass();
          if (handlerInstance.packetId !== undefined) {
            this.register(handlerInstance);
          }
        }
      } catch (error: any) {
        logger.error(`Failed to load handler from ${file}`, { error: error.message });
      }
    }
  }

  private register(handler: IPacketHandler<any>): void {
    this.handlers.set(handler.packetId, handler);
    logger.info(`Packet handler registered for packet ID: ${handler.packetId}`);
  }

  public getHandler(packetId: number): IPacketHandler<any> | undefined {
    return this.handlers.get(packetId);
  }
}
