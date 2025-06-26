import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestShopData from "../../packets/implementations/RequestShopData";
import logger from "../../utils/Logger";
import ShopData from "../../packets/implementations/ShopData";

export default class RequestShopDataHandler implements IPacketHandler<RequestShopData> {
  public readonly packetId = RequestShopData.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RequestShopData): void {
    if (!client.user) {
      logger.warn("RequestShopData received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const shopDataPayload = server.shopService.getShopData(client.user, client.shopCountryCode);
    client.sendPacket(new ShopData(shopDataPayload));
  }
}
