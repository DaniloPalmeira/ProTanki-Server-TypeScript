import { BasePacket } from "@/packets/implementations/BasePacket";
import { IEmpty } from "@/packets/interfaces/IEmpty";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import * as SystemTypes from "./system.types";

export class SystemMessage extends BasePacket implements SystemTypes.ISystemMessage {
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

export class Ping extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer {
        return new BufferWriter().getBuffer();
    }
    static getId(): number {
        return -555602629;
    }
}

export class Pong extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer {
        return new BufferWriter().getBuffer();
    }
    static getId(): number {
        return 1484572481;
    }
}

export class CaptchaLocation extends BasePacket implements SystemTypes.ICaptchaLocation {
    captchaLocations: Array<number> = [];

    constructor(captchaLocations?: Array<number>) {
        super();
        if (captchaLocations) {
            this.captchaLocations = captchaLocations;
        }
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        const itemsCount = reader.readInt32BE();
        this.captchaLocations = [];
        for (let i = 0; i < itemsCount; i++) {
            this.captchaLocations.push(reader.readInt32BE());
        }
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.captchaLocations.length);
        for (const location of this.captchaLocations) {
            writer.writeInt32BE(location);
        }
        return writer.getBuffer();
    }
    static getId(): number {
        return 321971701;
    }
}

export class InviteEnabled extends BasePacket implements SystemTypes.IInviteEnabled {
    requireInviteCode: boolean = false;

    constructor(requireInviteCode?: boolean) {
        super();
        if (requireInviteCode !== undefined) {
            this.requireInviteCode = requireInviteCode;
        }
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.requireInviteCode = reader.readUInt8() === 1;
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeUInt8(this.requireInviteCode ? 1 : 0);
        return writer.getBuffer();
    }
    static getId(): number {
        return 444933603;
    }
}