import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import { CommandContext, ICommand } from "../ICommand";

export default class PingCommand implements ICommand {
  name: string = "ping";
  description: string = "Exibe o histórico de latência dos últimos 10 pings.";
  permissionLevel: ChatModeratorLevel = ChatModeratorLevel.NONE;

  async execute(context: CommandContext, args: string[]): Promise<void> {
    const history = context.executor.pingHistory;

    if (history.length === 0) {
      context.reply("Nenhum histórico de ping disponível ainda. Aguarde a primeira medição.");
      return;
    }

    const historyString = history.join("ms, ") + "ms";
    const average = history.reduce((a, b) => a + b, 0) / history.length;

    context.reply(`Histórico de ping: [${historyString}]. Média: ${average.toFixed(0)}ms.`);
  }
}
