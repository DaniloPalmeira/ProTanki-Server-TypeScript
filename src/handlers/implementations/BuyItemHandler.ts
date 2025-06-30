import BuyItemPacket from "../../packets/implementations/BuyItemPacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";

export default class BuyItemHandler implements IPacketHandler<BuyItemPacket> {
  public readonly packetId = BuyItemPacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: BuyItemPacket): Promise<void> {
    if (!client.user || !packet.itemId) {
      return;
    }

    try {
      await server.shopService.purchaseItem(client.user, packet.itemId, packet.quantity, packet.price);
      // Nenhum pacote de sucesso é enviado, conforme solicitado.
    } catch (error: any) {
      logger.warn(`Failed to purchase item ${packet.itemId} for user ${client.user.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
