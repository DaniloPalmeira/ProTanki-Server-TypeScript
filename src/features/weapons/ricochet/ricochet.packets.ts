import { BasePacket } from "@/packets/BasePacket";
import { BufferReader } from "@/utils/buffer/buffer.reader";
import { BufferWriter } from "@/utils/buffer/buffer.writer";
import * as RicochetTypes from "./ricochet.types";

export class RicochetShotCommandPacket extends BasePacket implements RicochetTypes.IRicochetShotCommand {
    public clientTime: number = 0;
    public shortId: number = 0;
    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.clientTime = reader.readInt32BE();
        this.shortId = reader.readInt32BE();
        this.x = reader.readInt16BE();
        this.y = reader.readInt16BE();
        this.z = reader.readInt16BE();
    }

    public write(): Buffer {
        throw new Error("This is a client-to-server packet only.");
    }

    public static getId(): number {
        return -1907971330;
    }
}

export class RicochetShotPacket extends BasePacket implements RicochetTypes.IRicochetShotPacket {
    public nickname: string | null;
    public x: number;
    public y: number;
    public z: number;

    constructor(data?: RicochetTypes.IRicochetShotPacketData) {
        super();
        this.nickname = data?.nickname ?? null;
        this.x = data?.x ?? 0;
        this.y = data?.y ?? 0;
        this.z = data?.z ?? 0;
    }

    public read(buffer: Buffer): void {
        throw new Error("This is a server-to-client packet only.");
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nickname);
        writer.writeInt16BE(this.x);
        writer.writeInt16BE(this.y);
        writer.writeInt16BE(this.z);
        return writer.getBuffer();
    }

    public static getId(): number {
        return -118119523;
    }
}