import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStartShootingFreezePacket } from "../interfaces/IStartShootingFreeze";
import { BasePacket } from "./BasePacket";

export default class StartShootingFreezePacket extends BasePacket implements IStartShootingFreezePacket {
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
        return `StartShootingFreezePacket(nickname=${this.nickname})`;
    }

    public static getId(): number {
        return -1171353580;
    }
}