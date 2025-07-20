import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import SetLoadingScreenImagePacket from "../../packets/implementations/SetLoadingScreenImagePacket";
import RequestNextTipPacket from "../../packets/implementations/RequestNextTipPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ResourceId } from "../../types/resourceTypes";
import { ResourceManager } from "../../utils/ResourceManager";

const tipResources: ResourceId[] = ["tips/tip_1", "tips/tip_2", "tips/tip_3"];

export default class RequestNextTipHandler implements IPacketHandler<RequestNextTipPacket> {
  public readonly packetId = RequestNextTipPacket.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RequestNextTipPacket): void {
    const randomTipId = tipResources[Math.floor(Math.random() * tipResources.length)];

    try {
      const resourceIdLow = ResourceManager.getIdlowById(randomTipId);
      client.sendPacket(new SetLoadingScreenImagePacket(resourceIdLow));
    } catch (error) {
      // Se os recursos de dica ainda não foram adicionados, envia um fallback para evitar crash.
      client.sendPacket(new SetLoadingScreenImagePacket(ResourceManager.getIdlowById("ui/login_background")));
    }
  }
}
