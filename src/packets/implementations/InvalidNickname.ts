import { IEmpty } from "../interfaces/IEmpty";
import { BasePacket } from "./BasePacket";

export default class InvalidNickname extends BasePacket implements IEmpty {
    read(buffer: Buffer): void {}

    write(): Buffer {
        return Buffer.alloc(0);
    }

    toString(): string {
        return `InvalidNickname()`;
    }

    static getId(): number {
        return 1480924803;
    }
}