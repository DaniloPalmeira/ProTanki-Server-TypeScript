import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStartShootingMachinegunPacket } from "../interfaces/IMachinegunShot";
import { BasePacket } from "./BasePacket";

export default class StartShootingMachinegunPacket extends BasePacket implements IStartShootingMachinegunPacket {
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
        return `StartShootingMachinegunPacket(nickname=${this.nickname})`;
    }

    public static getId(): number {
        return -1616602030;
    }
}