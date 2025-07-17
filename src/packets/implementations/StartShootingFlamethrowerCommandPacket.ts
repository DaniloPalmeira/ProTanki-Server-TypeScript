import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStartShootingFlamethrowerCommand } from "../interfaces/IStartShootingFlamethrower";
import { BasePacket } from "./BasePacket";

export default class StartShootingFlamethrowerCommandPacket extends BasePacket implements IStartShootingFlamethrowerCommand {
    public clientTime: number = 0;

    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.clientTime = reader.readInt32BE();
    }

    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.clientTime);
        return writer.getBuffer();
    }

    public toString(): string {
        return `StartShootingFlamethrowerCommandPacket(clientTime=${this.clientTime})`;
    }

    public static getId(): number {
        return -1986638927;
    }
}