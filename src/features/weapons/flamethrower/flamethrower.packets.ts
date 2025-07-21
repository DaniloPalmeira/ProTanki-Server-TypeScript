import { BasePacket } from "@/packets/base.packet";
import { BufferReader } from "@/utils/buffer/buffer.reader";
import { BufferWriter } from "@/utils/buffer/buffer.writer";
import * as FlamethrowerTypes from "./flamethrower.types";

export class StartShootingFlamethrowerCommandPacket extends BasePacket implements FlamethrowerTypes.IStartShootingFlamethrowerCommand {
    public clientTime: number = 0;
    public read(buffer: Buffer): void {
        this.clientTime = new BufferReader(buffer).readInt32BE();
    }
    public write(): Buffer {
        return new BufferWriter().writeInt32BE(this.clientTime).getBuffer();
    }
    public static getId(): number {
        return -1986638927;
    }
}

export class StartShootingFlamethrowerPacket extends BasePacket implements FlamethrowerTypes.IStartShootingFlamethrowerPacket {
    public nickname: string | null;
    constructor(nickname: string | null = null) {
        super();
        this.nickname = nickname;
    }
    public read(buffer: Buffer): void {
        this.nickname = new BufferReader(buffer).readOptionalString();
    }
    public write(): Buffer {
        return new BufferWriter().writeOptionalString(this.nickname).getBuffer();
    }
    public static getId(): number {
        return 1212381771;
    }
}

export class StopShootingFlamethrowerCommandPacket extends BasePacket implements FlamethrowerTypes.IStopShootingFlamethrowerCommand {
    public clientTime: number = 0;
    public read(buffer: Buffer): void {
        this.clientTime = new BufferReader(buffer).readInt32BE();
    }
    public write(): Buffer {
        return new BufferWriter().writeInt32BE(this.clientTime).getBuffer();
    }
    public static getId(): number {
        return -1300958299;
    }
}

export class StopShootingFlamethrowerPacket extends BasePacket implements FlamethrowerTypes.IStopShootingFlamethrowerPacket {
    public nickname: string | null;
    constructor(nickname: string | null = null) {
        super();
        this.nickname = nickname;
    }
    public read(buffer: Buffer): void {
        this.nickname = new BufferReader(buffer).readOptionalString();
    }
    public write(): Buffer {
        return new BufferWriter().writeOptionalString(this.nickname).getBuffer();
    }
    public static getId(): number {
        return 1333088437;
    }
}