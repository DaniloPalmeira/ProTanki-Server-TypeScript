import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import RequestFriendsListWindow from "../../packets/implementations/RequestFriendsListWindow";
import ShowFriendsListWindow from "../../packets/implementations/ShowFriendsListWindow";

export default class RequestFriendsListWindowHandler implements IPacketHandler<RequestFriendsListWindow> {
  public readonly packetId = RequestFriendsListWindow.getId();

  public execute(client: ProTankiClient, server: ProTankiServer): void {
    if (!client.user) {
      logger.warn("RequestFriendsListWindow received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    client.sendPacket(new ShowFriendsListWindow());
  }
}
