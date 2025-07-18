import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IThunderStaticShotCommand } from "../interfaces/IThunderShot";
import { BasePacket } from "./BasePacket";

export default class ThunderStaticShotCommandPacket extends BasePacket implements IThunderStaticShotCommand {
    public clientTime: number = 0;
    public position: IVector3 | null = null;

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.clientTime = reader.readInt32BE();
        this.position = reader.readOptionalVector3();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.clientTime);
        writer.writeOptionalVector3(this.position);
        return writer.getBuffer();
    }

    public toString(): string {
        return `ThunderStaticShotCommandPacket(clientTime=${this.clientTime}, position=${JSON.stringify(this.position)})`;
    }

    public static getId(): number {
        return 1501310158;
    }
}