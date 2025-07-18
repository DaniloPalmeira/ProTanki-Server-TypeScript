import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IThunderTargetShotCommand } from "../interfaces/IThunderShot";
import { BasePacket } from "./BasePacket";

export default class ThunderTargetShotCommandPacket extends BasePacket implements IThunderTargetShotCommand {
    public clientTime: number = 0;
    public internalPosition: IVector3 | null = null;
    public nicknameTarget: string | null = null;
    public incarnationTarget: number = 0;
    public positionTarget: IVector3 | null = null;
    public positionInWorld: IVector3 | null = null;

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.clientTime = reader.readInt32BE();
        this.internalPosition = reader.readOptionalVector3();
        this.nicknameTarget = reader.readOptionalString();
        this.incarnationTarget = reader.readInt16BE();
        this.positionTarget = reader.readOptionalVector3();
        this.positionInWorld = reader.readOptionalVector3();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.clientTime);
        writer.writeOptionalVector3(this.internalPosition);
        writer.writeOptionalString(this.nicknameTarget);
        writer.writeInt16BE(this.incarnationTarget);
        writer.writeOptionalVector3(this.positionTarget);
        writer.writeOptionalVector3(this.positionInWorld);
        return writer.getBuffer();
    }

    public toString(): string {
        return `ThunderTargetShotCommandPacket(target=${this.nicknameTarget}, position=${JSON.stringify(this.internalPosition)})`;
    }

    public static getId(): number {
        return 259979915;
    }
}