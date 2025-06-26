import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import SetShopCountry from "../../packets/implementations/SetShopCountry";

export default class SetShopCountryHandler implements IPacketHandler<SetShopCountry> {
  public readonly packetId = SetShopCountry.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: SetShopCountry): void {
    if (packet.countryCode) {
      client.shopCountryCode = packet.countryCode.toUpperCase();
      logger.info(`Client ${client.getRemoteAddress()} set shop country to ${client.shopCountryCode}`);
    }
  }
}
