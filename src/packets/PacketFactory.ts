import fs from "fs";
import path from "path";
import { IPacket } from "./interfaces/IPacket";
import logger from "../utils/Logger";

const PACKET_DIR = path.join(__dirname, "implementations");
const VALID_EXTENSIONS = [".js", ".ts"];
const packets: Map<number, new () => IPacket> = new Map();

function loadPackets(): void {
  const files = fs.readdirSync(PACKET_DIR).filter((file) =>
    VALID_EXTENSIONS.some((ext) => file.endsWith(ext))
  );

  for (const file of files) {
    try {
      const module = require(path.join(PACKET_DIR, file));
      const PacketClass = module.default;

      if (PacketClass && typeof PacketClass === "function") {
        const instance = new PacketClass();
        if (typeof instance.getId === "function" && typeof instance.read === "function") {
          packets.set(instance.getId(), PacketClass);
          logger.info(`Loaded packet: ${file}`, { packetId: instance.getId() });
        } else {
          logger.warn(`Packet class in ${file} does not implement IPacket correctly`);
        }
      }
    } catch (error) {
      logger.error(`Failed to load packet from ${file}`, { error });
    }
  }
}

loadPackets();

export function PacketFactory(id: number): IPacket | null {
  const PacketClass = packets.get(id);
  if (!PacketClass) {
    logger.warn(`No packet found for ID: ${id}`);
    return null;
  }
  return new PacketClass();
}