import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import SendChatMessage from "../../packets/implementations/SendChatMessage";
import { CommandContext } from "../../commands/ICommand";
import { IChatMessageData } from "../../packets/interfaces/IChatHistory";
import ChatHistory from "../../packets/implementations/ChatHistory";
import logger from "../../utils/Logger";

export default class SendChatMessageHandler implements IPacketHandler<SendChatMessage> {
  public readonly packetId = SendChatMessage.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SendChatMessage): Promise<void> {
    if (!client.user || !packet.message) {
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

    const configs = await server.configService.getAllConfigs();
    const antifloodEnabled = configs.chatAntifloodEnabled === "true";

    if (antifloodEnabled) {
      const charDelay = parseInt(configs.chatCharDelayFactor || "0");
      const baseDelay = parseInt(configs.chatMessageBaseDelay || "0");
      const cooldown = packet.message.length * charDelay + baseDelay;

      const now = Date.now();
      const lastMessageTime = client.user.lastMessageTimestamp?.getTime() || 0;

      if (now - lastMessageTime < cooldown) {
        logger.warn(`User ${client.user.username} is sending messages too fast.`, { client: client.getRemoteAddress() });
        return;
      }
    }

    const populatedMessage = await server.chatService.postMessage(client.user, packet.targetNickname, packet.message);

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
    server.broadcastToLobby(packetToSend);
  }
}
