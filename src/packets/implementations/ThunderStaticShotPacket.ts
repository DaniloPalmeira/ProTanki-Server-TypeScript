import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IThunderStaticShotPacket, IThunderStaticShotPacketData } from "../interfaces/IThunderShot";
import { BasePacket } from "./BasePacket";

export default class ThunderStaticShotPacket extends BasePacket implements IThunderStaticShotPacket {
    public nickname: string | null;
    public position: IVector3 | null;

    constructor(data?: IThunderStaticShotPacketData) {
        super();
        this.nickname = data?.nickname ?? null;
        this.position = data?.position ?? null;
    }

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.nickname = reader.readOptionalString();
        this.position = reader.readOptionalVector3();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nickname);
        writer.writeOptionalVector3(this.position);
        return writer.getBuffer();
    }

    public toString(): string {
        return `ThunderStaticShotPacket(nickname=${this.nickname}, position=${JSON.stringify(this.position)})`;
    }

    public static getId(): number {
        return 1690491826;
    }
}