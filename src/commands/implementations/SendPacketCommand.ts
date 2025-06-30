import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import RawPacket from "../../packets/implementations/dev/RawPacket";
import { CommandContext, ICommand } from "../ICommand";

export default class SendPacketCommand implements ICommand {
  name: string = "send";
  description: string = "Envia um pacote raw para um cliente ou para todos.";
  permissionLevel: ChatModeratorLevel = ChatModeratorLevel.ADMINISTRATOR;

  async execute(context: CommandContext, args: string[]): Promise<void> {
    if (args.length < 2) {
      context.reply("Uso: /send <all|ip|username> <packetId> [payloadHex]");
      return;
    }

    const targetIdentifier = args[0];
    const packetId = parseInt(args[1], 10);
    const payloadHex = args[2] || "";

    if (isNaN(packetId)) {
      context.reply("Erro: ID do pacote inválido. Deve ser um número.");
      return;
    }

    let payload: Buffer;
    try {
      payload = Buffer.from(payloadHex, "hex");
    } catch (error) {
      context.reply("Erro: Payload hexadecimal inválido.");
      return;
    }

    const packet = new RawPacket(packetId, payload);

    if (targetIdentifier.toLowerCase() === "all") {
      context.server.broadcastToBattleList(packet);
      context.reply(`Pacote ${packetId} enviado para todos os clientes no lobby.`);
      return;
    }

    let targetClient = context.server.findClientByIp(targetIdentifier);
    if (!targetClient) {
      targetClient = context.server.findClientByUsername(targetIdentifier);
    }

    if (targetClient) {
      targetClient.sendPacket(packet);
      context.reply(`Pacote ${packetId} enviado para ${targetIdentifier}.`);
    } else {
      context.reply(`Erro: Cliente "${targetIdentifier}" não encontrado.`);
    }
  }
}
