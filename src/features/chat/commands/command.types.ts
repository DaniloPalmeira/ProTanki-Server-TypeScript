import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { ChatModeratorLevel } from "@/shared/models/enums/chat-moderator-level.enum";

export interface CommandContext {
    executor: GameClient;
    server: GameServer;
    reply: (message: string) => void;
}

export interface ICommand {
    name: string;
    description: string;
    permissionLevel: ChatModeratorLevel;

    execute(context: CommandContext, args: string[]): Promise<void>;
}