import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStopShootingFlamethrowerPacket } from "../interfaces/IStopShootingFlamethrower";
import { BasePacket } from "./BasePacket";

export default class StopShootingFlamethrowerPacket extends BasePacket implements IStopShootingFlamethrowerPacket {
    public nickname: string | null;

    constructor(nickname: string | null = null) {
        super();
        this.nickname = nickname;
    }

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.nickname = reader.readOptionalString();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nickname);
        return writer.getBuffer();
    }

    public toString(): string {
        return `StopShootingFlamethrowerPacket(nickname=${this.nickname})`;
    }

    public static getId(): number {
        return 1333088437;
    }
}