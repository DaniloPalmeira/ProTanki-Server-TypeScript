import EquipItemRequestPacket from "../../packets/implementations/EquipItemRequestPacket";
import MountItemPacket from "../../packets/implementations/MountItemPacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "../IPacketHandler";

export default class EquipItemRequestHandler implements IPacketHandler<EquipItemRequestPacket> {
  public readonly packetId = EquipItemRequestPacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: EquipItemRequestPacket): Promise<void> {
    if (!client.user || !packet.itemId) {
      return;
    }

    try {
      await server.userService.equipItem(client.user, packet.itemId);
      client.sendPacket(new MountItemPacket(packet.itemId, true));
    } catch (error: any) {
      logger.warn(`Failed to equip item ${packet.itemId} for user ${client.user.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
