import ChatMessage, { IChatMessage } from "../models/ChatMessage";
import { UserDocument } from "../models/User";
import logger from "../utils/Logger";

export interface PopulatedChatMessage {
  sourceUser: UserDocument | null;
  targetUser: UserDocument | null;
  message: string;
  isSystemMessage: boolean;
  isWarning: boolean;
}

export class ChatService {
  public static async getChatHistory(limit: number): Promise<PopulatedChatMessage[]> {
    try {
      const messages = await ChatMessage.find().sort({ timestamp: -1 }).limit(limit).populate<{ sourceUser: UserDocument | null }>("sourceUser", "username rank chatModeratorLevel").populate<{ targetUser: UserDocument | null }>("targetUser", "username rank chatModeratorLevel").exec();

      return messages.reverse() as unknown as PopulatedChatMessage[];
    } catch (error) {
      logger.error("Failed to get chat history", { error });
      return [];
    }
  }
}
