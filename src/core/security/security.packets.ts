import { BasePacket } from "@/packets/base.packet";
import { BufferReader } from "@/utils/buffer/buffer.reader";
import { BufferWriter } from "@/utils/buffer/buffer.writer";
import * as SecurityTypes from "./security.types";

export class Protection extends BasePacket implements SecurityTypes.IProtection {
    keys: Array<number>;

    constructor(keys: Array<number>) {
        super();
        this.keys = keys;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        const length = reader.readInt32BE();
        this.keys = [];
        for (let i = 0; i < length; i++) {
            this.keys.push(reader.readInt8());
        }
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.keys.length);
        this.keys.forEach((val) => {
            writer.writeInt8(val);
        });
        return writer.getBuffer();
    }
    static getId(): number {
        return 2001736388;
    }
}