import fs from "fs";
import path from "path";
import { IPacket } from "./interfaces/IPacket";
import logger from "../utils/Logger";

const PACKET_DIR = path.join(__dirname, "implementations");
const VALID_EXTENSIONS = [".js", ".ts"];
const packets: Map<number, new (...args: any[]) => IPacket> = new Map();

function loadPackets(): void {
  const files = fs.readdirSync(PACKET_DIR).filter((file) => VALID_EXTENSIONS.some((ext) => file.endsWith(ext) && file !== "BasePacket.ts"));

  for (const file of files) {
    try {
      const module = require(path.join(PACKET_DIR, file));
      const PacketClass = module.default;

      if (PacketClass && typeof PacketClass.getId === "function") {
        const packetId = PacketClass.getId();
        packets.set(packetId, PacketClass);
        logger.info(`Loaded packet: ${file}`, { packetId });
      } else {
        logger.warn(`Packet class in ${file} does not implement a static getId function.`);
      }
    } catch (error: any) {
      logger.error(`Failed to load packet from ${file}`, { error: error.message });
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
