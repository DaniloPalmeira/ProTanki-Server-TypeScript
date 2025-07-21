import { IPacket } from "@/packets/packet.interfaces";
import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";

export interface IPacketHandler<T extends IPacket> {
    packetId: number;
    execute(client: GameClient, server: GameServer, packet: T): Promise<void> | void;
}