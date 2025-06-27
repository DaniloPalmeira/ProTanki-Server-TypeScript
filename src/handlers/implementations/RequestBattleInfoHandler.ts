import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestBattleInfo from "../../packets/implementations/RequestBattleInfo";
import { battleDetailsData } from "../../config/BattleDetailsData";
import ConfirmBattleInfo from "../../packets/implementations/ConfirmBattleInfo";
import BattleDetails from "../../packets/implementations/BattleDetails";
import { battleDataObject } from "../../config/BattleData";
import { ResourceManager } from "../../utils/ResourceManager";
import { ResourceId } from "../../types/resourceTypes";
import logger from "../../utils/Logger";

export default class RequestBattleInfoHandler implements IPacketHandler<RequestBattleInfo> {
  public readonly packetId = RequestBattleInfo.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestBattleInfo): Promise<void> {
    const requestedId = packet.battleId;
    let confirmedId = requestedId;
    let battleDetails = requestedId ? battleDetailsData[requestedId] : null;

    if (!battleDetails) {
      confirmedId = Object.keys(battleDetailsData)[0];
      if (!confirmedId) {
        logger.error("No battle details available in BattleDetailsData config.");
        return;
      }
      battleDetails = battleDetailsData[confirmedId];
    }

    client.sendPacket(new ConfirmBattleInfo(confirmedId));

    const detailsCopy = JSON.parse(JSON.stringify(battleDetails));

    const mapInfo = battleDataObject.maps.find((m) => m.mapId === detailsCopy.mapId);
    if (mapInfo) {
      try {
        detailsCopy.preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
      } catch (error) {
        logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
        detailsCopy.preview = 0;
      }
    } else {
      detailsCopy.preview = 0;
    }

    const jsonData = JSON.stringify(detailsCopy);
    client.sendPacket(new BattleDetails(jsonData));
  }
}
