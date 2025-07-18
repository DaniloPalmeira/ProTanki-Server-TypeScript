import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IThunderTargetShotPacket, IThunderTargetShotPacketData } from "../interfaces/IThunderShot";
import { BasePacket } from "./BasePacket";

export default class ThunderTargetShotPacket extends BasePacket implements IThunderTargetShotPacket {
    public nicknameShooter: string | null;
    public nicknameTarget: string | null;
    public internalPosition: IVector3 | null;

    constructor(data?: IThunderTargetShotPacketData) {
        super();
        this.nicknameShooter = data?.nicknameShooter ?? null;
        this.nicknameTarget = data?.nicknameTarget ?? null;
        this.internalPosition = data?.internalPosition ?? null;
    }

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.nicknameShooter = reader.readOptionalString();
        this.nicknameTarget = reader.readOptionalString();
        this.internalPosition = reader.readOptionalVector3();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nicknameShooter);
        writer.writeOptionalString(this.nicknameTarget);
        writer.writeOptionalVector3(this.internalPosition);
        return writer.getBuffer();
    }

    public toString(): string {
        return `ThunderTargetShotPacket(shooter=${this.nicknameShooter}, target=${this.nicknameTarget}, position=${JSON.stringify(this.internalPosition)})`;
    }

    public static getId(): number {
        return -190359403;
    }
}