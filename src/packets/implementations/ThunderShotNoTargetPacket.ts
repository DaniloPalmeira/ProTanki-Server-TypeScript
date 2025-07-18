import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IThunderShotNoTargetPacket } from "../interfaces/IThunderShot";
import { BasePacket } from "./BasePacket";

export default class ThunderShotNoTargetPacket extends BasePacket implements IThunderShotNoTargetPacket {
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
        return `ThunderShotNoTargetPacket(nickname=${this.nickname})`;
    }

    public static getId(): number {
        return 958509220;
    }
}