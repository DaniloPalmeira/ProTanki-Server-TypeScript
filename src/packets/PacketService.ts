import fs from "fs";
import path from "path";
import { IPacket } from "./interfaces/IPacket";
import logger from "../utils/Logger";

export class PacketService {
  private packets = new Map<number, new (...args: any[]) => IPacket>();

  public constructor() {
    this.loadPackets(path.join(__dirname, "implementations"));
  }

  private loadPackets(dir: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        this.loadPackets(fullPath);
        continue;
      }

      const file = entry.name;
      if (!(file.endsWith(".ts") || file.endsWith(".js")) || file.endsWith("BasePacket.ts")) {
        continue;
      }

      try {
        const module = require(fullPath);
        const PacketClass = module.default;

        if (PacketClass && typeof PacketClass.getId === "function") {
          const packetId = PacketClass.getId();
          this.packets.set(packetId, PacketClass);
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
