import { BasePacket } from "@/packets/implementations/BasePacket";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import * as SocialTypes from "./social.types";

export class SocialNetwork extends BasePacket implements SocialTypes.ISocialNetwork {
    socialNetworkParams: Array<Array<String>>;

    constructor(socialNetworkParams: Array<Array<String>>) {
        super();
        this.socialNetworkParams = socialNetworkParams;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        const socialNetworkParams: Array<Array<String>> = [];
        const socialNetworkParamsLength = reader.readInt32BE();

        for (let i = 0; i < socialNetworkParamsLength; i++) {
            const button: Array<String> = [];
            button.push(reader.readOptionalString() ?? "unknow");
            button.push(reader.readOptionalString() ?? "unknow");
            socialNetworkParams.push(button);
        }
        this.socialNetworkParams = socialNetworkParams;
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.socialNetworkParams.length);
        for (const button of this.socialNetworkParams) {
            for (const val of button) {
                writer.writeOptionalString(val as string);
            }
        }
        return writer.getBuffer();
    }

    static getId(): number {
        return -1715719586;
    }
}