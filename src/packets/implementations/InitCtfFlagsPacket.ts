import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IVector3 } from "../interfaces/geom/IVector3";
import { IInitCtfFlags, IInitCtfFlagsData } from "../interfaces/IInitCtfFlags";
import { BasePacket } from "./BasePacket";

export default class InitCtfFlagsPacket extends BasePacket implements IInitCtfFlags {
    flagBasePositionBlue: IVector3 | null;
    flagCarrierIdBlue: string | null;
    flagPositionBlue: IVector3 | null;
    blueFlagSprite: number;
    bluePedestalModel: number;
    flagBasePositionRed: IVector3 | null;
    flagCarrierIdRed: string | null;
    flagPositionRed: IVector3 | null;
    redFlagSprite: number;
    redPedestalModel: number;
    flagDropSound: number;
    flagReturnSound: number;
    flagTakeSound: number;
    winSound: number;

    constructor(data: IInitCtfFlagsData) {
        super();
        this.flagBasePositionBlue = data.flagBasePositionBlue;
        this.flagCarrierIdBlue = data.flagCarrierIdBlue;
        this.flagPositionBlue = data.flagPositionBlue;
        this.blueFlagSprite = data.blueFlagSprite;
        this.bluePedestalModel = data.bluePedestalModel;
        this.flagBasePositionRed = data.flagBasePositionRed;
        this.flagCarrierIdRed = data.flagCarrierIdRed;
        this.flagPositionRed = data.flagPositionRed;
        this.redFlagSprite = data.redFlagSprite;
        this.redPedestalModel = data.redPedestalModel;
        this.flagDropSound = data.flagDropSound;
        this.flagReturnSound = data.flagReturnSound;
        this.flagTakeSound = data.flagTakeSound;
        this.winSound = data.winSound;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.flagBasePositionBlue = reader.readOptionalVector3();
        this.flagCarrierIdBlue = reader.readOptionalString();
        this.flagPositionBlue = reader.readOptionalVector3();
        this.blueFlagSprite = reader.readInt32BE();
        this.bluePedestalModel = reader.readInt32BE();
        this.flagBasePositionRed = reader.readOptionalVector3();
        this.flagCarrierIdRed = reader.readOptionalString();
        this.flagPositionRed = reader.readOptionalVector3();
        this.redFlagSprite = reader.readInt32BE();
        this.redPedestalModel = reader.readInt32BE();
        this.flagDropSound = reader.readInt32BE();
        this.flagReturnSound = reader.readInt32BE();
        this.flagTakeSound = reader.readInt32BE();
        this.winSound = reader.readInt32BE();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalVector3(this.flagBasePositionBlue);
        writer.writeOptionalString(this.flagCarrierIdBlue);
        writer.writeOptionalVector3(this.flagPositionBlue);
        writer.writeInt32BE(this.blueFlagSprite);
        writer.writeInt32BE(this.bluePedestalModel);
        writer.writeOptionalVector3(this.flagBasePositionRed);
        writer.writeOptionalString(this.flagCarrierIdRed);
        writer.writeOptionalVector3(this.flagPositionRed);
        writer.writeInt32BE(this.redFlagSprite);
        writer.writeInt32BE(this.redPedestalModel);
        writer.writeInt32BE(this.flagDropSound);
        writer.writeInt32BE(this.flagReturnSound);
        writer.writeInt32BE(this.flagTakeSound);
        writer.writeInt32BE(this.winSound);
        return writer.getBuffer();
    }

    toString(): string {
        return `InitCtfFlagsPacket(blueBase=${JSON.stringify(this.flagBasePositionBlue)}, redBase=${JSON.stringify(this.flagBasePositionRed)})`;
    }

    static getId(): number {
        return 789790814;
    }
}