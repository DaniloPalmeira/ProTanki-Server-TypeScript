import { BasePacket } from "@/packets/BasePacket";
import { IVector3 } from "@/shared/types/geom/IVector3";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import * as MachinegunTypes from "./machinegun.types";

export class StartShootingMachinegunCommandPacket extends BasePacket implements MachinegunTypes.IStartShootingMachinegunCommand {
    public clientTime: number = 0;
    public read(buffer: Buffer): void {
        this.clientTime = new BufferReader(buffer).readInt32BE();
    }
    public write(): Buffer {
        return new BufferWriter().writeInt32BE(this.clientTime).getBuffer();
    }
    public static getId(): number {
        return -520655432;
    }
}

export class StartShootingMachinegunPacket extends BasePacket implements MachinegunTypes.IStartShootingMachinegunPacket {
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
        return -1616602030;
    }
}

export class MachinegunShotCommandPacket extends BasePacket implements MachinegunTypes.IMachinegunShotCommand {
    public clientTime: number = 0;
    public shotDirection: IVector3 | null = null;
    public targets: MachinegunTypes.IMachinegunShotTargetCommandData[] = [];
    public read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.clientTime = reader.readInt32BE();
        this.shotDirection = reader.readOptionalVector3();
        const targetLen = reader.readInt32BE();
        this.targets = [];
        for (let i = 0; i < targetLen; i++) {
            this.targets.push({
                localHitPoint: reader.readOptionalVector3(),
                orientation: reader.readOptionalVector3(),
                position: reader.readOptionalVector3(),
                nickname: reader.readOptionalString(),
                turretAngle: reader.readFloatBE(),
            });
        }
    }
    public write(): Buffer {
        throw new Error("This is a client-to-server packet only.");
    }
    public static getId(): number {
        return -1889502569;
    }
}

export class MachinegunShotPacket extends BasePacket implements MachinegunTypes.IMachinegunShotPacket {
    public nickname: string | null;
    public shotDirection: IVector3 | null;
    public targets: MachinegunTypes.IMachinegunShotTargetPacketData[];
    constructor(data?: MachinegunTypes.IMachinegunShotPacketData) {
        super();
        this.nickname = data?.nickname ?? null;
        this.shotDirection = data?.shotDirection ?? null;
        this.targets = data?.targets ?? [];
    }
    public read(buffer: Buffer): void {
        throw new Error("This is a server-to-client packet only.");
    }
    public write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nickname);
        writer.writeOptionalVector3(this.shotDirection);
        writer.writeInt32BE(this.targets.length);
        for (const target of this.targets) {
            writer.writeOptionalVector3(target.direction);
            writer.writeOptionalVector3(target.localHitPoint);
            writer.writeInt8(target.numberHits);
            writer.writeOptionalString(target.nickname);
        }
        return writer.getBuffer();
    }
    public static getId(): number {
        return -891286317;
    }
}

export class StopShootingMachinegunCommandPacket extends BasePacket implements MachinegunTypes.IStopShootingMachinegunCommand {
    public clientTime: number = 0;
    public read(buffer: Buffer): void {
        this.clientTime = new BufferReader(buffer).readInt32BE();
    }
    public write(): Buffer {
        return new BufferWriter().writeInt32BE(this.clientTime).getBuffer();
    }
    public static getId(): number {
        return 1794372798;
    }
}

export class StopShootingMachinegunPacket extends BasePacket implements MachinegunTypes.IStopShootingMachinegunPacket {
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
        return 133452238;
    }
}