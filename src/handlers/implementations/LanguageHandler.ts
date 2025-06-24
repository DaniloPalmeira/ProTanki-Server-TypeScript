import Language from "../../packets/implementations/Language";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";
import logger from "../../utils/Logger";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";

export default class LanguageHandler implements IPacketHandler<Language> {
  public readonly packetId = Language.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: Language): Promise<void> {
    client.language = packet.lang;
    logger.info(`Setting language to: ${packet.lang}`, {
      client: client.getRemoteAddress(),
    });

    await LoginWorkflow.sendLoginScreenData(client, server);
  }
}
