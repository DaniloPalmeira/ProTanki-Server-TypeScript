import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "@/utils/logger";
import { Ping, Pong } from "./system.packets";

export class PongHandler implements IPacketHandler<Pong> {
    public readonly packetId = Pong.getId();

    public execute(client: GameClient, server: GameServer, packet: Pong): void {
        if (client.lastPingSentTimestamp > 0) {
            const currentPing = Date.now() - client.lastPingSentTimestamp;
            client.pingHistory.push(currentPing);
            if (client.pingHistory.length > 10) {
                client.pingHistory.shift();
            }
            logger.info(`Ping for ${client.user?.username || client.getRemoteAddress()}: ${currentPing}ms`);
            client.lastPingSentTimestamp = 0;
        }

        setTimeout(() => {
            client.sendPacket(new Ping());
        }, 10000);
    }
}