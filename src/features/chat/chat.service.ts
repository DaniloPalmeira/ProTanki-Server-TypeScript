import ChatMessage from "./chat.model";
import { UserDocument } from "@/models/User";
import logger from "@/utils/Logger";
import { UserService } from "@/shared/services/UserService";
import { LobbyService } from "../lobby/lobby.service";

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

    private async _parseBattleLinks(message: string, lobbyService: LobbyService): Promise<string> {
        const regex = /#\/battle\/([a-f0-9]+)/gi;
        const matches = Array.from(message.matchAll(regex));
        let processedMessage = message;

        for (const match of matches) {
            const fullPattern = match[0];
            const battleId = match[1];

            const battle = lobbyService.getBattleById(battleId);

            if (battle) {
                const battleName = battle.settings.name;
                const replacement = `#battle|${battleName}|${battleId}`;
                processedMessage = processedMessage.replace(fullPattern, replacement);
            }
        }

        return processedMessage;
    }

    public async postMessage(sourceUser: UserDocument, targetNickname: string | null, message: string, lobbyService: LobbyService): Promise<PopulatedChatMessage> {
        let targetUser: UserDocument | null = null;
        if (targetNickname) {
            targetUser = await this.userService.findUserByUsername(targetNickname);
        }

        const processedMessage = await this._parseBattleLinks(message, lobbyService);

        const chatMessage = new ChatMessage({
            sourceUser: sourceUser._id,
            targetUser: targetUser ? targetUser._id : null,
            message: processedMessage,
        });

        await chatMessage.save();

        sourceUser.lastMessageTimestamp = new Date();
        await sourceUser.save();

        return {
            sourceUser,
            targetUser,
            message: processedMessage,
            isSystemMessage: false,
            isWarning: false,
        };
    }
}