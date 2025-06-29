import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import CreateBattleRequest from "../../packets/implementations/CreateBattleRequest";
import { BattleMode, EquipmentConstraintsMode } from "../../models/Battle";
import { battleDataObject } from "../../config/BattleData";
import { ResourceManager } from "../../utils/ResourceManager";
import { ResourceId } from "../../types/resourceTypes";
import CreateBattleResponse from "../../packets/implementations/CreateBattleResponse";
import logger from "../../utils/Logger";

export default class CreateBattleHandler implements IPacketHandler<CreateBattleRequest> {
  public readonly packetId = CreateBattleRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: CreateBattleRequest): Promise<void> {
    if (!client.user) {
      return;
    }

    const battle = server.battleService.createBattle(packet, client.user);

    const battleModeStr = BattleMode[packet.battleMode];
    const equipmentConstraintsModeStr = EquipmentConstraintsMode[packet.equipmentConstraintsMode];

    const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
    let preview = 0;
    if (mapInfo) {
      try {
        preview = ResourceManager.getIdlowById(mapInfo.previewResource as ResourceId);
      } catch (error) {
        logger.warn(`Could not find resource for map preview: ${mapInfo.previewResource}`);
      }
    }

    const basePayload = {
      battleId: battle.battleId,
      battleMode: battleModeStr,
      map: battle.settings.mapId,
      maxPeople: battle.settings.maxPeopleCount,
      name: battle.settings.name,
      privateBattle: battle.settings.privateBattle,
      proBattle: battle.settings.proBattle,
      minRank: battle.settings.minRank,
      maxRank: battle.settings.maxRank,
      preview: preview,
      parkourMode: battle.settings.parkourMode,
      equipmentConstraintsMode: equipmentConstraintsModeStr,
      suspicionLevel: "NONE",
    };

    let finalPayload;

    if (battle.isTeamMode()) {
      finalPayload = {
        ...basePayload,
        usersBlue: battle.usersBlue.map((u) => u.username),
        usersRed: battle.usersRed.map((u) => u.username),
      };
    } else {
      finalPayload = {
        ...basePayload,
        users: battle.users.map((u) => u.username),
      };
    }

    client.sendPacket(new CreateBattleResponse(JSON.stringify(finalPayload)));
  }
}
