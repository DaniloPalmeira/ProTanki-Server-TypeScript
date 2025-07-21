import { BasePacket } from "@/packets/implementations/BasePacket";
import { IEmpty } from "@/packets/interfaces/IEmpty";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import * as LoaderTypes from "./loader.types";

export class RequestNextTipPacket extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }
    write(): Buffer {
        return new BufferWriter().getBuffer();
    }
    static getId(): number {
        return -1376947245;
    }
}

export class SetLoadingScreenImagePacket extends BasePacket implements LoaderTypes.ISetLoadingScreenImage {
    resourceImageIdLow: number = 0;

    constructor(resourceImageIdLow?: number) {
        super();
        if (resourceImageIdLow !== undefined) {
            this.resourceImageIdLow = resourceImageIdLow;
        }
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.resourceImageIdLow = reader.readInt32BE();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.resourceImageIdLow);
        return writer.getBuffer();
    }
    static getId(): number {
        return 2094741924;
    }
}

export class ResourceCallback extends BasePacket implements LoaderTypes.IResourceCallback {
    callbackId: number;

    constructor(callbackId: number = 0) {
        super();
        this.callbackId = callbackId;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.callbackId = reader.readInt32BE();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.callbackId);
        return writer.getBuffer();
    }
    static getId(): number {
        return -82304134;
    }
}