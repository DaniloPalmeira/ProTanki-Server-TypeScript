import { IPacket } from "@/packets/interfaces/IPacket";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";

export interface IPacketHandler<T extends IPacket> {
    packetId: number;
    execute(client: ProTankiClient, server: ProTankiServer, packet: T): Promise<void> | void;
}