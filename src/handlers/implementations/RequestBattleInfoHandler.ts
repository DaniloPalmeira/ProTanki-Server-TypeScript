import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestBattleInfo from "../../packets/implementations/RequestBattleInfo";
import ConfirmBattleInfo from "../../packets/implementations/ConfirmBattleInfo";
import BattleDetails from "../../packets/implementations/BattleDetails";
import { battleDataObject } from "../../config/BattleData";
import { ResourceManager } from "../../utils/ResourceManager";
import { ResourceId } from "../../types/resourceTypes";
import logger from "../../utils/Logger";
import { BattleMode, EquipmentConstraintsMode } from "../../models/Battle";

export default class RequestBattleInfoHandler implements IPacketHandler<RequestBattleInfo> {
  public readonly packetId = RequestBattleInfo.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestBattleInfo): Promise<void> {
    const requestedId = packet.battleId;
    let battle = requestedId ? server.battleService.getBattleById(requestedId) : undefined;
    let confirmedId = requestedId;

    if (!battle) {
      const allBattles = server.battleService.getBattles();
      if (allBattles.length === 0) {
        logger.error("No battles available to display details.");
        return;
      }
      battle = allBattles[0];
      confirmedId = battle.battleId;
    }

    client.sendPacket(new ConfirmBattleInfo(confirmedId));

    const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle!.settings.mapId);
    let preview = 0;
    if (mapInfo) {
      try {
        preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
      } catch (error) {
        logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
      }
    }

    const detailsPayload = {
      battleMode: BattleMode[battle.settings.battleMode],
      itemId: battle.battleId,
      scoreLimit: battle.settings.scoreLimit,
      timeLimitInSec: battle.settings.timeLimitInSec,
      preview: preview,
      maxPeopleCount: battle.settings.maxPeopleCount,
      name: battle.settings.name,
      proBattle: battle.settings.proBattle,
      minRank: battle.settings.minRank,
      maxRank: battle.settings.maxRank,
      roundStarted: true, // Placeholder
      spectator: false, // Placeholder
      withoutBonuses: battle.settings.withoutBonuses,
      withoutCrystals: battle.settings.withoutCrystals,
      withoutSupplies: battle.settings.withoutSupplies,
      proBattleEnterPrice: 150, // Placeholder
      timeLeftInSec: battle.settings.timeLimitInSec, // Placeholder
      userPaidNoSuppliesBattle: true, // Placeholder
      proBattleTimeLeftInSec: 1, // Placeholder
      parkourMode: battle.settings.parkourMode,
      equipmentConstraintsMode: EquipmentConstraintsMode[battle.settings.equipmentConstraintsMode],
      reArmorEnabled: battle.settings.reArmorEnabled,
      reducedResistance: battle.settings.reducedResistances,
      esportDropTiming: battle.settings.esportDropTiming,
      withoutGoldBoxes: battle.settings.withoutGoldBoxes,
      withoutGoldSiren: battle.settings.withoutGoldSiren,
      withoutGoldZone: battle.settings.withoutGoldZone,
      withoutMedkit: battle.settings.withoutMedkit,
      withoutMines: battle.settings.withoutMines,
      randomGold: battle.settings.randomGold,
      dependentCooldownEnabled: battle.settings.dependentCooldownEnabled,
      usersBlue: [], // Placeholder
      usersRed: [], // Placeholder
      scoreRed: 0, // Placeholder
      scoreBlue: 0, // Placeholder
      autoBalance: battle.settings.autoBalance,
      friendlyFire: battle.settings.friendlyFire,
    };

    const jsonData = JSON.stringify(detailsPayload);
    client.sendPacket(new BattleDetails(jsonData));
  }
}
