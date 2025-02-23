import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ILanguage } from "../interfaces/ILanguage";
import CaptchaLocation from "./CaptchaLocation";
import LoadDependencies from "./LoadDependencies";
import Ping from "./Ping";
import SocialNetwork from "./SocialNetwork";

export default class Language implements ILanguage {
  lang: string;

  constructor(lang: string) {
    this.lang = lang;
  }

  read(buffer: Buffer): void {
    const isEmpty = buffer.readInt8(0) === 1;
    this.lang = "";
    if (!isEmpty) {
      const length = buffer.readInt32BE(1);
      this.lang = buffer.toString("utf8", 5, 5 + length);
    }
  }

  write(): Buffer {
    const isEmpty = this.lang.length === 0;
    const packet = Buffer.alloc(isEmpty ? 1 : 5 + this.lang.length);
    packet.writeInt8(isEmpty ? 1 : 0, 0);
    if (!isEmpty) {
      packet.writeInt32BE(this.lang.length, 1);
      packet.write(this.lang, 5);
    }
    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    client.language = this.lang;
    client.sendPacket(new Ping());
    console.log(`Setting language to: ${this.lang}`);
    client.sendPacket(new SocialNetwork(server.getSocialNetworks()));
    client.sendPacket(new CaptchaLocation([]));
    client.sendPacket(
      new LoadDependencies(
        {
          resources: [
            {
              idhigh: "0",
              idlow: 1395300,
              versionhigh: "0",
              versionlow: 3,
              lazy: false,
              fileNames: ["en.jpg", "pt_br.jpg", "ru.jpg", "ua.jpg"],
              alpha: false,
              type: 13,
            },
          ],
        },
        2
      )
    );
    client.sendPacket(
      new LoadDependencies(
        {
          resources: [
            {
              idhigh: "0",
              idlow: 122842,
              versionhigh: "0",
              versionlow: 1,
              lazy: false,
              alpha: false,
              type: 10,
            },
          ],
        },
        3
      )
    );
  }

  toString(): string {
    return `Language(lang: ${this.lang})`;
  }

  getId(): number {
    return -1864333717;
  }
}
