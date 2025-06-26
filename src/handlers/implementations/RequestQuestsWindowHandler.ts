import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import RequestQuestsWindow from "../../packets/implementations/RequestQuestsWindow";
import ShowQuestsWindow from "../../packets/implementations/ShowQuestsWindow";

export default class RequestQuestsWindowHandler implements IPacketHandler<RequestQuestsWindow> {
  public readonly packetId = RequestQuestsWindow.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestQuestsWindow): Promise<void> {
    if (!client.user) {
      logger.warn("RequestQuestsWindow received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const questData = await server.questService.getQuestsForUser(client.user);
    client.sendPacket(new ShowQuestsWindow(questData));
  }
}
