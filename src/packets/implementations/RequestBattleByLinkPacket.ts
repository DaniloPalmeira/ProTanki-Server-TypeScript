import { BufferReader } from "../../utils/buffer/BufferReader";
import { BufferWriter } from "../../utils/buffer/BufferWriter";
import { IRequestBattleByLink } from "../interfaces/IRequestBattleByLink";
import { BasePacket } from "./BasePacket";

export default class RequestBattleByLinkPacket extends BasePacket implements IRequestBattleByLink {
    battleId: string | null = null;

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.battleId = reader.readOptionalString();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.battleId);
        return writer.getBuffer();
    }

    toString(): string {
        return `RequestBattleByLinkPacket(battleId=${this.battleId})`;
    }

    static getId(): number {
        return -604091695;
    }
}