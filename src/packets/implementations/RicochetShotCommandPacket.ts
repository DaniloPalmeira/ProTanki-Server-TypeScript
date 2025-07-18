import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRicochetShotCommand } from "../interfaces/IRicochetShot";
import { BasePacket } from "./BasePacket";

export default class RicochetShotCommandPacket extends BasePacket implements IRicochetShotCommand {
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
        const writer = new BufferWriter();
        writer.writeInt32BE(this.clientTime);
        writer.writeInt32BE(this.shortId);
        writer.writeInt16BE(this.x);
        writer.writeInt16BE(this.y);
        writer.writeInt16BE(this.z);
        return writer.getBuffer();
    }

    public toString(): string {
        return `RicochetShotCommandPacket(clientTime=${this.clientTime}, shortId=${this.shortId}, x=${this.x}, y=${this.y}, z=${this.z})`;
    }

    public static getId(): number {
        return -1907971330;
    }
}