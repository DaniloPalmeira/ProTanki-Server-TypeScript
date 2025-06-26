import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import { CommandContext, ICommand } from "../ICommand";

export default class FlowCommand implements ICommand {
  name: string = "flow";
  description: string = "Entra em modo de 'fluxo', onde cada mensagem é um ID de pacote a ser enviado.";
  permissionLevel: ChatModeratorLevel = ChatModeratorLevel.ADMINISTRATOR;

  async execute(context: CommandContext, args: string[]): Promise<void> {
    if (args.length < 1) {
      context.reply("Uso: /flow <all|ip|username> [payloadHex]");
      return;
    }

    const target = args[0];
    const payloadHex = args[1] || "";

    try {
      Buffer.from(payloadHex, "hex");
    } catch (error) {
      context.reply("Erro: Payload hexadecimal inválido.");
      return;
    }

    context.executor.isInFlowMode = true;
    context.executor.flowTarget = target;
    context.executor.flowPayloadHex = payloadHex;

    context.reply(`Você entrou no modo de fluxo. Alvo: ${target}, Payload: '${payloadHex}'. Digite '/exit' para sair.`);
  }
}
