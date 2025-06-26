import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import { CommandContext, ICommand } from "../ICommand";

export default class ExitCommand implements ICommand {
  name: string = "exit";
  description: string = "Sai do modo de 'fluxo' de envio de pacotes.";
  permissionLevel: ChatModeratorLevel = ChatModeratorLevel.ADMINISTRATOR;

  async execute(context: CommandContext, args: string[]): Promise<void> {
    if (!context.executor.isInFlowMode) {
      context.reply("Você não está no modo de fluxo.");
      return;
    }

    context.executor.isInFlowMode = false;
    context.executor.flowTarget = null;
    context.executor.flowPayloadHex = null;

    context.reply("Você saiu do modo de fluxo.");
  }
}
