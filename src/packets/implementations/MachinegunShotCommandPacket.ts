import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IMachinegunShotCommand, IMachinegunShotTargetCommandData } from "../interfaces/IMachinegunShot";
import { BasePacket } from "./BasePacket";

export default class MachinegunShotCommandPacket extends BasePacket implements IMachinegunShotCommand {
    public clientTime: number = 0;
    public shotDirection: IVector3 | null = null;
    public targets: IMachinegunShotTargetCommandData[] = [];

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

    public toString(): string {
        return `MachinegunShotCommandPacket(clientTime=${this.clientTime}, targets=${this.targets.length})`;
    }

    public static getId(): number {
        return -1889502569;
    }
}