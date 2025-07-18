import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStartShootingMachinegunCommand } from "../interfaces/IMachinegunShot";
import { BasePacket } from "./BasePacket";

export default class StartShootingMachinegunCommandPacket extends BasePacket implements IStartShootingMachinegunCommand {
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
        return `StartShootingMachinegunCommandPacket(clientTime=${this.clientTime})`;
    }

    public static getId(): number {
        return -520655432;
    }
}