import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IStopShootingMachinegunCommand } from "../interfaces/IMachinegunShot";
import { BasePacket } from "./BasePacket";

export default class StopShootingMachinegunCommandPacket extends BasePacket implements IStopShootingMachinegunCommand {
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
        return `StopShootingMachinegunCommandPacket(clientTime=${this.clientTime})`;
    }

    public static getId(): number {
        return 1794372798;
    }
}