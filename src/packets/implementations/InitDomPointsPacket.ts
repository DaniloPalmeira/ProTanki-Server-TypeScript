import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IDomPoint, IInitDomPoints, IInitDomPointsData } from "../interfaces/IInitDomPoints";
import { BasePacket } from "./BasePacket";

export default class InitDomPointsPacket extends BasePacket implements IInitDomPoints {
    keypointTriggerRadius: number;
    keypointVisorHeight: number;
    minesRestrictionRadius: number;
    points: IDomPoint[];
    bigLetters: number;
    blueCircle: number;
    bluePedestalTexture: number;
    blueRay: number;
    blueRayTip: number;
    neutralCircle: number;
    neutralPedestalTexture: number;
    pedestal: number;
    redCircle: number;
    redPedestalTexture: number;
    redRay: number;
    redRayTip: number;
    pointCaptureStartNegativeSound: number;
    pointCaptureStartPositiveSound: number;
    pointCaptureStopNegativeSound: number;
    pointCaptureStopPositiveSound: number;
    pointCapturedNegativeSound: number;
    pointCapturedPositiveSound: number;
    pointNeutralizedNegativeSound: number;
    pointNeutralizedPositiveSound: number;
    pointScoreDecreasingSound: number;
    pointScoreIncreasingSound: number;

    constructor(data: IInitDomPointsData) {
        super();
        this.keypointTriggerRadius = data.keypointTriggerRadius;
        this.keypointVisorHeight = data.keypointVisorHeight;
        this.minesRestrictionRadius = data.minesRestrictionRadius;
        this.points = data.points;
        this.bigLetters = data.bigLetters;
        this.blueCircle = data.blueCircle;
        this.bluePedestalTexture = data.bluePedestalTexture;
        this.blueRay = data.blueRay;
        this.blueRayTip = data.blueRayTip;
        this.neutralCircle = data.neutralCircle;
        this.neutralPedestalTexture = data.neutralPedestalTexture;
        this.pedestal = data.pedestal;
        this.redCircle = data.redCircle;
        this.redPedestalTexture = data.redPedestalTexture;
        this.redRay = data.redRay;
        this.redRayTip = data.redRayTip;
        this.pointCaptureStartNegativeSound = data.pointCaptureStartNegativeSound;
        this.pointCaptureStartPositiveSound = data.pointCaptureStartPositiveSound;
        this.pointCaptureStopNegativeSound = data.pointCaptureStopNegativeSound;
        this.pointCaptureStopPositiveSound = data.pointCaptureStopPositiveSound;
        this.pointCapturedNegativeSound = data.pointCapturedNegativeSound;
        this.pointCapturedPositiveSound = data.pointCapturedPositiveSound;
        this.pointNeutralizedNegativeSound = data.pointNeutralizedNegativeSound;
        this.pointNeutralizedPositiveSound = data.pointNeutralizedPositiveSound;
        this.pointScoreDecreasingSound = data.pointScoreDecreasingSound;
        this.pointScoreIncreasingSound = data.pointScoreIncreasingSound;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.keypointTriggerRadius = reader.readFloatBE();
        this.keypointVisorHeight = reader.readFloatBE();
        this.minesRestrictionRadius = reader.readFloatBE();

        const pointsLen = reader.readInt32BE();
        this.points = [];
        for (let i = 0; i < pointsLen; i++) {
            this.points.push({
                id: reader.readInt32BE(),
                name: reader.readOptionalString(),
                position: reader.readOptionalVector3(),
                score: reader.readFloatBE(),
                scoreChangeRate: reader.readFloatBE(),
                state: reader.readInt32BE(),
                tankIds: reader.readStringArray(),
            });
        }

        this.bigLetters = reader.readInt32BE();
        this.blueCircle = reader.readInt32BE();
        this.bluePedestalTexture = reader.readInt32BE();
        this.blueRay = reader.readInt32BE();
        this.blueRayTip = reader.readInt32BE();
        this.neutralCircle = reader.readInt32BE();
        this.neutralPedestalTexture = reader.readInt32BE();
        this.pedestal = reader.readInt32BE();
        this.redCircle = reader.readInt32BE();
        this.redPedestalTexture = reader.readInt32BE();
        this.redRay = reader.readInt32BE();
        this.redRayTip = reader.readInt32BE();

        this.pointCaptureStartNegativeSound = reader.readInt32BE();
        this.pointCaptureStartPositiveSound = reader.readInt32BE();
        this.pointCaptureStopNegativeSound = reader.readInt32BE();
        this.pointCaptureStopPositiveSound = reader.readInt32BE();
        this.pointCapturedNegativeSound = reader.readInt32BE();
        this.pointCapturedPositiveSound = reader.readInt32BE();
        this.pointNeutralizedNegativeSound = reader.readInt32BE();
        this.pointNeutralizedPositiveSound = reader.readInt32BE();
        this.pointScoreDecreasingSound = reader.readInt32BE();
        this.pointScoreIncreasingSound = reader.readInt32BE();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeFloatBE(this.keypointTriggerRadius);
        writer.writeFloatBE(this.keypointVisorHeight);
        writer.writeFloatBE(this.minesRestrictionRadius);

        writer.writeInt32BE(this.points.length);
        for (const point of this.points) {
            writer.writeInt32BE(point.id);
            writer.writeOptionalString(point.name);
            writer.writeOptionalVector3(point.position);
            writer.writeFloatBE(point.score);
            writer.writeFloatBE(point.scoreChangeRate);
            writer.writeInt32BE(point.state);
            writer.writeStringArray(point.tankIds);
        }

        writer.writeInt32BE(this.bigLetters);
        writer.writeInt32BE(this.blueCircle);
        writer.writeInt32BE(this.bluePedestalTexture);
        writer.writeInt32BE(this.blueRay);
        writer.writeInt32BE(this.blueRayTip);
        writer.writeInt32BE(this.neutralCircle);
        writer.writeInt32BE(this.neutralPedestalTexture);
        writer.writeInt32BE(this.pedestal);
        writer.writeInt32BE(this.redCircle);
        writer.writeInt32BE(this.redPedestalTexture);
        writer.writeInt32BE(this.redRay);
        writer.writeInt32BE(this.redRayTip);

        writer.writeInt32BE(this.pointCaptureStartNegativeSound);
        writer.writeInt32BE(this.pointCaptureStartPositiveSound);
        writer.writeInt32BE(this.pointCaptureStopNegativeSound);
        writer.writeInt32BE(this.pointCaptureStopPositiveSound);
        writer.writeInt32BE(this.pointCapturedNegativeSound);
        writer.writeInt32BE(this.pointCapturedPositiveSound);
        writer.writeInt32BE(this.pointNeutralizedNegativeSound);
        writer.writeInt32BE(this.pointNeutralizedPositiveSound);
        writer.writeInt32BE(this.pointScoreDecreasingSound);
        writer.writeInt32BE(this.pointScoreIncreasingSound);
        console.log("InitDomPoints Hex:", writer.getBuffer().toString("hex"));
        return writer.getBuffer();
    }

    toString(): string {
        console.log("InitDomPointsPacket.toString() called");
        return `InitDomPointsPacket(points=${this.points.length})`;
    }

    static getId(): number {
        return -1337059439;
    }
}