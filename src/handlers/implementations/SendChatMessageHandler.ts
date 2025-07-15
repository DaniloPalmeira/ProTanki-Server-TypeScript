import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import SendChatMessage from "../../packets/implementations/SendChatMessage";
import { CommandContext } from "../../commands/ICommand";
import { IChatMessageData } from "../../packets/interfaces/IChatHistory";
import ChatHistory from "../../packets/implementations/ChatHistory";
import logger from "../../utils/Logger";
import RawPacket from "../../packets/implementations/dev/RawPacket";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class SendChatMessageHandler implements IPacketHandler<SendChatMessage> {
  public readonly packetId = SendChatMessage.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SendChatMessage): Promise<void> {
    if (!client.user || !packet.message) {
      return;
    }

    if (client.isInFlowMode && !packet.message.startsWith("/")) {
      const packetIdStr = packet.message.trim();
      const packetId = parseInt(packetIdStr, 10);

      if (isNaN(packetId)) {
        client.sendPacket(new SystemMessage("ID de pacote inválido. Deve ser um número."));
        return;
      }

      const targetIdentifier = client.flowTarget!;
      const payloadHex = client.flowPayloadHex!;
      let payload: Buffer;

      try {
        payload = Buffer.from(payloadHex, "hex");
      } catch (error) {
        client.sendPacket(new SystemMessage("Erro: Payload hexadecimal inválido definido no fluxo."));
        return;
      }

      const packetToSend = new RawPacket(packetId, payload);
      let replyMessage = "";

      if (targetIdentifier.toLowerCase() === "all") {
        server.broadcastToAll(packetToSend);
        replyMessage = `Fluxo: Pacote ${packetId} enviado para todos os clientes.`;
      } else {
        const targetClient = server.findClientByIp(targetIdentifier) || server.findClientByUsername(targetIdentifier);
        if (targetClient) {
          targetClient.sendPacket(packetToSend);
          replyMessage = `Fluxo: Pacote ${packetId} enviado para ${targetIdentifier}.`;
        } else {
          replyMessage = `Fluxo: Erro: Cliente "${targetIdentifier}" não encontrado.`;
        }
      }

      const replyPacket = new ChatHistory([{ message: replyMessage, isSystem: true, isWarning: false, source: null, target: null }]);
      client.sendPacket(replyPacket);
      return;
    }

    if (packet.message.startsWith("/")) {
      const replyFunction = (message: string) => {
        const replyData: IChatMessageData = {
          message,
          isSystem: true,
          isWarning: false,
          source: null,
          target: null,
        };
        const replyPacket = new ChatHistory([replyData]);
        client.sendPacket(replyPacket);
      };

      const context: CommandContext = {
        executor: client,
        server: server,
        reply: replyFunction,
      };
      await server.commandService.process(packet.message, context);
      return;
    }

    const configService = server.configService;
    if (configService.getChatAntifloodEnabled()) {
      const cooldown = packet.message.length * configService.getChatCharDelayFactor() + configService.getChatMessageBaseDelay();

      const now = Date.now();
      const lastMessageTime = client.user.lastMessageTimestamp?.getTime() || 0;

      if (now - lastMessageTime < cooldown) {
        logger.warn(`User ${client.user.username} is sending messages too fast.`, { client: client.getRemoteAddress() });
        return;
      }
    }

    const populatedMessage = await server.chatService.postMessage(client.user, packet.targetNickname, packet.message, server.battleService);

    const messageData: IChatMessageData = {
      message: populatedMessage.message,
      isSystem: populatedMessage.isSystemMessage,
      isWarning: populatedMessage.isWarning,
      source: populatedMessage.sourceUser
        ? {
          uid: populatedMessage.sourceUser.username,
          rank: populatedMessage.sourceUser.rank,
          moderatorLevel: populatedMessage.sourceUser.chatModeratorLevel,
          ip: null,
        }
        : null,
      target: populatedMessage.targetUser
        ? {
          uid: populatedMessage.targetUser.username,
          rank: populatedMessage.targetUser.rank,
          moderatorLevel: populatedMessage.targetUser.chatModeratorLevel,
          ip: null,
        }
        : null,
    };

    const packetToSend = new ChatHistory([messageData]);
    server.broadcastToLobbyChat(packetToSend);
  }
}