import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "../../utils/Logger";
import SkipQuestPaid from "../../packets/implementations/SkipQuestPaid";
import SystemMessage from "../../packets/implementations/SystemMessage";
import ReplaceQuest from "../../packets/implementations/ReplaceQuest";
import { IQuest } from "../../packets/interfaces/IShowQuestsWindow";
import { QuestDefinitions } from "../../config/QuestData";
import { ResourceManager } from "../../utils/ResourceManager";
import UpdateCrystals from "../../packets/implementations/UpdateCrystals";

export default class SkipQuestPaidHandler implements IPacketHandler<SkipQuestPaid> {
  public readonly packetId = SkipQuestPaid.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SkipQuestPaid): Promise<void> {
    const currentUser = client.user;
    if (!currentUser) {
      return;
    }

    try {
      const result = await server.questService.rerollQuest(currentUser, packet.missionId, true);

      const definition = QuestDefinitions.find((def) => def.type === result.newQuest.questType);
      if (!definition) throw new Error("New quest definition not found after reroll.");

      const newQuestPacketData: IQuest = {
        canSkipForFree: result.newQuest.canSkipForFree,
        description: definition.description.replace("%n", result.newQuest.finishCriteria.toString()),
        finishCriteria: result.newQuest.finishCriteria,
        image: ResourceManager.getIdlowById(definition.imageResource),
        progress: result.newQuest.progress,
        questId: result.newQuest.questId,
        skipCost: definition.skipCost,
        prizes: result.newQuest.prizes,
      };

      const updatedUser = await server.userService.findUserByUsername(currentUser.username);
      if (updatedUser) {
        client.user = updatedUser;
      }

      client.sendPacket(new ReplaceQuest(result.oldQuestId, newQuestPacketData));

      if (client.user) {
        client.sendPacket(new UpdateCrystals(client.user.crystals));
      }
    } catch (error: any) {
      logger.error(`Failed to skip quest with payment for user ${currentUser.username}`, { error: error.message });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
