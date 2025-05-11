import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ILanguage } from "../interfaces/ILanguage";
import { BasePacket } from "./BasePacket";
import CaptchaLocation from "./CaptchaLocation";
import LoadDependencies from "./LoadDependencies";
import Ping from "./Ping";
import SocialNetwork from "./SocialNetwork";
import { ResourceManager } from "../../utils/ResourceManager";
import logger from "../../utils/Logger";

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
    logger.info(`Setting language to: ${this.lang}`, {
      client: client.getRemoteAddress(),
    });
    client.sendPacket(new SocialNetwork(server.getSocialNetworks()));
    client.sendPacket(new CaptchaLocation([]));

    const languageImages = ResourceManager.getResourceById("language_images");
    if (languageImages) {
      client.sendPacket(
        new LoadDependencies(
          {
            resources: [languageImages],
          },
          2
        )
      );
    } else {
      logger.warn("Language images resource not found");
    }

    const loginBackground = ResourceManager.getResourceById("login_background");
    if (loginBackground) {
      client.sendPacket(
        new LoadDependencies(
          {
            resources: [loginBackground],
          },
          3
        )
      );
    } else {
      logger.warn("Login background resource not found");
    }
  }

  toString(): string {
    return `Language(lang: ${this.lang})`;
  }

  getId(): number {
    return -1864333717;
  }
}
