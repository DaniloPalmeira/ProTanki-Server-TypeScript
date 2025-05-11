import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ILanguage } from "../interfaces/ILanguage";
import { BasePacket } from "./BasePacket";
import CaptchaLocation from "./CaptchaLocation";
import LoadDependencies from "./LoadDependencies";
import Ping from "./Ping";
import SocialNetwork from "./SocialNetwork";

export default class Language extends BasePacket implements ILanguage {
  lang: string;

  constructor(lang: string = "") {
    super();
    this.lang = lang;
  }

  read(buffer: Buffer): void {
    const { value } = this.readString(buffer, 0);
    this.lang = value;
  }

  write(): Buffer {
    return this.writeString(this.lang);
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