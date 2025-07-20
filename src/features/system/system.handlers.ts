import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "@/utils/Logger";
import { Ping, Pong } from "./system.packets";

export class PongHandler implements IPacketHandler<Pong> {
    public readonly packetId = Pong.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: Pong): void {
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