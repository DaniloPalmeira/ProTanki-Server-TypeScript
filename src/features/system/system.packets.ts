import { BasePacket } from "@/packets/implementations/BasePacket";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import { ISystemMessage } from "./system.types";

export default class SystemMessage extends BasePacket implements ISystemMessage {
    text: string | null = null;

    constructor(text?: string | null) {
        super();
        if (text) {
            this.text = text;
        }
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.text = reader.readOptionalString();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.text);
        return writer.getBuffer();
    }

    static getId(): number {
        return -600078553;
    }
}