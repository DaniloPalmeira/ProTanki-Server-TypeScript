import ChatMessage from "../models/ChatMessage";
import { UserDocument } from "../models/User";
import logger from "../utils/Logger";
import { UserService } from "./UserService";

export interface PopulatedChatMessage {
  sourceUser: UserDocument | null;
  targetUser: UserDocument | null;
  message: string;
  isSystemMessage: boolean;
  isWarning: boolean;
}

export class ChatService {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async getChatHistory(limit: number): Promise<PopulatedChatMessage[]> {
    try {
      const messages = await ChatMessage.find().sort({ timestamp: -1 }).limit(limit).populate<{ sourceUser: UserDocument | null }>("sourceUser", "username rank chatModeratorLevel").populate<{ targetUser: UserDocument | null }>("targetUser", "username rank chatModeratorLevel").exec();

      return messages.reverse() as unknown as PopulatedChatMessage[];
    } catch (error) {
      logger.error("Failed to get chat history", { error });
      return [];
    }
  }

  public async postMessage(sourceUser: UserDocument, targetNickname: string | null, message: string): Promise<PopulatedChatMessage> {
    let targetUser: UserDocument | null = null;
    if (targetNickname) {
      targetUser = await this.userService.findUserByUsername(targetNickname);
    }

    const chatMessage = new ChatMessage({
      sourceUser: sourceUser._id,
      targetUser: targetUser ? targetUser._id : null,
      message: message,
    });

    await chatMessage.save();

    sourceUser.lastMessageTimestamp = new Date();
    await sourceUser.save();

    return {
      sourceUser,
      targetUser,
      message,
      isSystemMessage: false,
      isWarning: false,
    };
  }
}
