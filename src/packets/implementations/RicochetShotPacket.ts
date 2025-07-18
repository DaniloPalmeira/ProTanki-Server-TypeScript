import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRicochetShotPacket, IRicochetShotPacketData } from "../interfaces/IRicochetShot";
import { BasePacket } from "./BasePacket";

export default class RicochetShotPacket extends BasePacket implements IRicochetShotPacket {
    public nickname: string | null;
    public x: number;
    public y: number;
    public z: number;

    constructor(data?: IRicochetShotPacketData) {
        super();
        this.nickname = data?.nickname ?? null;
        this.x = data?.x ?? 0;
        this.y = data?.y ?? 0;
        this.z = data?.z ?? 0;
    }

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.nickname = reader.readOptionalString();
        this.x = reader.readInt16BE();
        this.y = reader.readInt16BE();
        this.z = reader.readInt16BE();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nickname);
        writer.writeInt16BE(this.x);
        writer.writeInt16BE(this.y);
        writer.writeInt16BE(this.z);
        return writer.getBuffer();
    }

    public toString(): string {
        return `RicochetShotPacket(nickname=${this.nickname}, x=${this.x}, y=${this.y}, z=${this.z})`;
    }

    public static getId(): number {
        return -118119523;
    }
}