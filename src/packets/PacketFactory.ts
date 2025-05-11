import fs from "fs";
import path from "path";
import { IPacket } from "./interfaces/IPacket";
import logger from "../utils/Logger";

const PACKET_IDS = {
  CAPTCHA_LOCATION: 321971701,
  CHECK_NICKNAME_AVAILABLE: 1083705823,
  HIDE_LOADER: -1282173466,
  INVITE_CODE: 509394385,
  INVITE_CODE_INVALID: 312571157,
  INVITE_CODE_LOGIN: 714838911,
  INVITE_CODE_REGISTER: 184934482,
  INVITE_ENABLED: 444933603,
  LANGUAGE: -1864333717,
  LOAD_DEPENDENCIES: -1797047325,
  NICKNAME_AVAILABLE: -706679202,
  PING: -555602629,
  PROTECTION: 2001736388,
  REGISTRATION: -1277343167,
  RESOURCE_CALLBACK: -82304134,
  SOCIAL_NETWORK: -1715719586,
};

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