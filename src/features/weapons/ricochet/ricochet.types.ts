import { IPacket } from "@/packets/packet.interfaces";

export interface IRicochetShotCommand extends IPacket {
    clientTime: number;
    shortId: number;
    x: number;
    y: number;
    z: number;
}

export interface IRicochetShotPacketData {
    nickname: string | null;
    x: number;
    y: number;
    z: number;
}
export interface IRicochetShotPacket extends IPacket, IRicochetShotPacketData { }