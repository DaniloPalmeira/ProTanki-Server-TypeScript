import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { ChatModeratorLevel } from "@/shared/models/enums/chat-moderator-level.enum";

export interface CommandContext {
    executor: ProTankiClient;
    server: ProTankiServer;
    reply: (message: string) => void;
}

export interface ICommand {
    name: string;
    description: string;
    permissionLevel: ChatModeratorLevel;

    execute(context: CommandContext, args: string[]): Promise<void>;
}