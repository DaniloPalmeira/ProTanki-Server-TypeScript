import fs from "fs";
import path from "path";
import { IPacket } from "./interfaces/IPacket";

const packets: Map<number, { new (): IPacket }> = new Map();

const loadPackets = () => {
  const dir = path.join(__dirname, "implementations");
  fs.readdirSync(dir).forEach((file) => {
    if (file.endsWith(".ts") || file.endsWith(".js")) {
      const module = require(path.join(dir, file));
      const PacketClass = module.default;

      if (PacketClass && typeof PacketClass === "function") {
        const instance = new PacketClass();
        if (typeof instance.getId === "function") {
          packets.set(instance.getId(), PacketClass);
        }
      }
    }
  });
};

loadPackets();

export function PacketFactory(id: number): IPacket | null {
  const PacketClass = packets.get(id);
  if (!PacketClass) return null;

  return new PacketClass();
}
