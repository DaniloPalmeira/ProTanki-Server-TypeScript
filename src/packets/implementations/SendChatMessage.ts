import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { BasePacket } from "./BasePacket";
import { ISendChatMessage } from "../interfaces/ISendChatMessage";
import { ChatService } from "../../services/ChatService";
import { ConfigService } from "../../services/ConfigService";
import ChatHistory from "./ChatHistory";
import { IChatMessageData } from "../interfaces/IChatHistory";
import logger from "../../utils/Logger";

export default class SendChatMessage extends BasePacket implements ISendChatMessage {
  targetNickname: string | null = null;
  message: string = "";

  read(buffer: Buffer): void {
    let offset = 0;

    let isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const nickLength = buffer.readInt32BE(offset);
      offset += 4;
      this.targetNickname = buffer.toString("utf-8", offset, offset + nickLength);
      offset += nickLength;
    }

    isEmpty = buffer.readInt8(offset) === 1;
    offset += 1;
    if (!isEmpty) {
      const messageLength = buffer.readInt32BE(offset);
      offset += 4;
      this.message = buffer.toString("utf-8", offset, offset + messageLength);
    }
  }

  write(): Buffer {
    throw new Error("Method not implemented.");
  }

  async run(server: ProTankiServer, client: ProTankiClient): Promise<void> {
    if (!client.user || !this.message) {
      return;
    }

    const configs = await ConfigService.getAllConfigs();
    const antifloodEnabled = configs.chatAntifloodEnabled === "true";

    if (antifloodEnabled) {
      const charDelay = parseInt(configs.chatCharDelayFactor || "0");
      const baseDelay = parseInt(configs.chatMessageBaseDelay || "0");
      const cooldown = this.message.length * charDelay + baseDelay;

      const now = Date.now();
      const lastMessageTime = client.user.lastMessageTimestamp?.getTime() || 0;

      if (now - lastMessageTime < cooldown) {
        logger.warn(`User ${client.user.username} is sending messages too fast.`, { client: client.getRemoteAddress() });
        return;
      }
    }

    const populatedMessage = await ChatService.postMessage(client.user, this.targetNickname, this.message);

    const messageData: IChatMessageData = {
      message: populatedMessage.message,
      isSystem: populatedMessage.isSystemMessage,
      isWarning: populatedMessage.isWarning,
      source: populatedMessage.sourceUser
        ? {
            uid: populatedMessage.sourceUser.username,
            rank: populatedMessage.sourceUser.rank,
            moderatorLevel: populatedMessage.sourceUser.chatModeratorLevel,
            ip: " ",
          }
        : null,
      target: populatedMessage.targetUser
        ? {
            uid: populatedMessage.targetUser.username,
            rank: populatedMessage.targetUser.rank,
            moderatorLevel: populatedMessage.targetUser.chatModeratorLevel,
            ip: " ",
          }
        : null,
    };

    const packetToSend = new ChatHistory([messageData]);

    server.broadcastToLobby(packetToSend);
  }

  toString(): string {
    return `SendChatMessage(to: ${this.targetNickname}, message: ${this.message})`;
  }

  static getId(): number {
    return 705454610;
  }
}
