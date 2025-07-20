import fs from "fs";
import path from "path";
import { IPacket } from "./interfaces/IPacket";
import logger from "@/utils/Logger";

export class PacketService {
  private packets = new Map<number, new (...args: any[]) => IPacket>();

  public constructor() {
    this.loadPacketsFromDir(path.join(__dirname, "implementations"));
    this.loadPacketsFromDir(path.join(__dirname, "../features"));
  }

  private loadPacketsFromDir(dir: string): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.loadPacketsFromDir(fullPath);
        continue;
      }

      const file = entry.name;
      if (!(file.endsWith(".ts") || file.endsWith(".js")) || file.includes("BasePacket")) {
        continue;
      }

      try {
        const module = require(fullPath);
        for (const key in module) {
          const PacketClass = module[key];
          if (PacketClass && typeof PacketClass.getId === 'function' && PacketClass.prototype?.hasOwnProperty('read')) {
            try {
              const packetId = PacketClass.getId();
              if (this.packets.has(packetId)) {
                logger.warn(`Packet ID ${packetId} from ${file} is already registered. Overwriting.`);
              }
              this.packets.set(packetId, PacketClass);
            } catch (e) {
              // Ignora erros de classes base como BasePacket que não devem ser registradas
            }
          }
        }
      } catch (error: any) {
        logger.error(`Falha ao carregar o pacote de ${file}`, { error: error.message });
      }
    }
  }

  public createPacket(id: number): IPacket | null {
    const PacketClass = this.packets.get(id);
    if (!PacketClass) {
      return null;
    }
    return new PacketClass();
  }
}