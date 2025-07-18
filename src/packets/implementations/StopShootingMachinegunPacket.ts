import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStopShootingMachinegunPacket } from "../interfaces/IMachinegunShot";
import { BasePacket } from "./BasePacket";

export default class StopShootingMachinegunPacket extends BasePacket implements IStopShootingMachinegunPacket {
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
        return `StopShootingMachinegunPacket(nickname=${this.nickname})`;
    }

    public static getId(): number {
        return 133452238;
    }
}