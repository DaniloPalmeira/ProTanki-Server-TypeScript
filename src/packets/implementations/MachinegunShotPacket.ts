import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IMachinegunShotPacket, IMachinegunShotPacketData } from "../interfaces/IMachinegunShot";
import { BasePacket } from "./BasePacket";

export default class MachinegunShotPacket extends BasePacket implements IMachinegunShotPacket {
    public nickname: string | null;
    public shotDirection: IVector3 | null;
    public targets: {
        direction: IVector3 | null;
        localHitPoint: IVector3 | null;
        numberHits: number;
        nickname: string | null;
    }[];

    constructor(data?: IMachinegunShotPacketData) {
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

    public toString(): string {
        return `MachinegunShotPacket(nickname=${this.nickname}, targets=${this.targets.length})`;
    }

    public static getId(): number {
        return -891286317;
    }
}