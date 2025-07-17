import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStopShootingFreezePacket } from "../interfaces/IStopShootingFreeze";
import { BasePacket } from "./BasePacket";

export default class StopShootingFreezePacket extends BasePacket implements IStopShootingFreezePacket {
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
        return `StopShootingFreezePacket(nickname=${this.nickname})`;
    }

    public static getId(): number {
        return 979099084;
    }
}