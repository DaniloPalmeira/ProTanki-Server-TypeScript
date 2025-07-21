import { BasePacket } from "@/packets/BasePacket";
import { IEmpty } from "@/packets/IEmpty";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import * as InviteTypes from "./invite.types";

export class InviteCode extends BasePacket implements InviteTypes.IInviteCode {
    inviteCode: string | null;

    constructor(inviteCode: string | null = null) {
        super();
        this.inviteCode = inviteCode;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.inviteCode = reader.readOptionalString();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.inviteCode);
        return writer.getBuffer();
    }

    static getId(): number {
        return 509394385;
    }
}

export class InviteCodeInvalid extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }

    write(): Buffer {
        return new BufferWriter().getBuffer();
    }

    static getId(): number {
        return 312571157;
    }
}

export class InviteCodeLogin extends BasePacket implements InviteTypes.IInviteCodeLogin {
    nickname: string | null = null;

    constructor(nickname?: string | null) {
        super();
        if (nickname) {
            this.nickname = nickname;
        }
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.nickname = reader.readOptionalString();
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeOptionalString(this.nickname);
        return writer.getBuffer();
    }

    static getId(): number {
        return 714838911;
    }
}

export class InviteCodeRegister extends BasePacket implements IEmpty {
    read(buffer: Buffer): void { }

    write(): Buffer {
        return new BufferWriter().getBuffer();
    }

    static getId(): number {
        return 184934482;
    }
}