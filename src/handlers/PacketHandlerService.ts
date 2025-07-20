import fs from "fs";
import path from "path";
import logger from "@/utils/Logger";
import { IPacket } from "@/packets/interfaces/IPacket";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "./IPacketHandler";

export class PacketHandlerService {
  private handlers = new Map<number, IPacketHandler<any>>();

  public constructor() {
    this.loadHandlersFromDir(path.join(__dirname, "implementations"));
    this.loadHandlersFromDir(path.join(__dirname, "../features"));
  }

  private loadHandlersFromDir(dir: string): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.loadHandlersFromDir(fullPath);
        continue;
      }

      const file = entry.name;
      if (!(file.endsWith("handlers.ts") || file.endsWith("Handler.ts") || file.endsWith("handlers.js") || file.endsWith("Handler.js"))) {
        continue;
      }

      try {
        const module = require(fullPath);
        for (const key in module) {
          const HandlerClass = module[key];
          if (HandlerClass && typeof HandlerClass === "function" && HandlerClass.prototype.execute) {
            const handlerInstance: IPacketHandler<any> = new HandlerClass();
            if (handlerInstance.packetId !== undefined) {
              this.register(handlerInstance, file);
            }
          }
        }
      } catch (error: any) {
        logger.error(`Failed to load handler from ${file}`, { error: error.message });
      }
    }
  }

  private register(handler: IPacketHandler<any>, fileName: string): void {
    if (this.handlers.has(handler.packetId)) {
      logger.warn(`Packet handler for ID ${handler.packetId} is being overwritten. Check for duplicate handlers.`);
    }
    this.handlers.set(handler.packetId, handler);
    logger.info(`Packet handler registered for packet ID: ${handler.packetId} from ${fileName}`);
  }

  public getHandler(packetId: number): IPacketHandler<any> | undefined {
    return this.handlers.get(packetId);
  }
}