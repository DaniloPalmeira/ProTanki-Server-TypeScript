import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import SkipQuestPaid from "../../packets/implementations/SkipQuestPaid";
import SystemMessage from "../../packets/implementations/SystemMessage";
import ReplaceQuest from "../../packets/implementations/ReplaceQuest";
import { IQuest } from "../../packets/interfaces/IShowQuestsWindow";
import { QuestDefinitions } from "../../config/QuestData";
import { ResourceManager } from "../../utils/ResourceManager";

export default class SkipQuestPaidHandler implements IPacketHandler<SkipQuestPaid> {
  public readonly packetId = SkipQuestPaid.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SkipQuestPaid): Promise<void> {
    const currentUser = client.user;
    if (!currentUser) {
      return;
    }

    try {
      const result = await server.questService.rerollQuest(currentUser, packet.missionId, true);

      const definition = QuestDefinitions.find((def) => def.id === result.newQuest.definitionId);
      if (!definition) throw new Error("New quest definition not found after reroll.");

      const newQuestPacketData: IQuest = {
        canSkipForFree: result.newQuest.canSkipForFree,
        description: definition.description,
        finishCriteria: definition.finishCriteria,
        image: ResourceManager.getIdlowById(definition.imageResource),
        progress: result.newQuest.progress,
        questId: result.newQuest.questId,
        skipCost: definition.skipCost,
        prizes: result.newQuest.prizes,
      };

      client.sendPacket(new ReplaceQuest(result.oldQuestId, newQuestPacketData));

      const updatedUser = await server.userService.findUserByUsername(currentUser.username);
      if (updatedUser) {
        client.user = updatedUser;
      }
    } catch (error: any) {
      logger.error(`Failed to skip quest with payment for user ${currentUser.username}`, { error: error.message });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
