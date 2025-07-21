import { GameServer } from "@/server/game.server";
import { UserDocument } from "@/shared/models/user.model";
import logger from "@/utils/logger";

export interface FullUserInfo {
    user: UserDocument;
    isOnline: boolean;
    isInBattle: boolean;
}

export class ProfileService {
    public async getFullUserInfo(server: GameServer, username: string): Promise<FullUserInfo | null> {
        const targetUser = await server.userService.findUserByUsername(username);
        if (!targetUser) {
            logger.warn(`User info requested for non-existent user: ${username}`);
            return null;
        }

        const targetClient = server.findClientByUsername(username);
        const isOnline = !!targetClient;
        const isInBattle = isOnline ? server.lobbyService.isUserInBattle(username) : false;

        return {
            user: targetUser,
            isOnline,
            isInBattle,
        };
    }
}