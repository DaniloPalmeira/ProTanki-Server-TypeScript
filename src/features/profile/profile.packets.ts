import { BasePacket } from "@/packets/implementations/BasePacket";
import { BufferReader } from "@/utils/buffer/BufferReader";
import { BufferWriter } from "@/utils/buffer/BufferWriter";
import * as ProfileTypes from "./profile.types";

export class GetUserInfo extends BasePacket implements ProfileTypes.IGetUserInfo {
    nickname: string | null;

    constructor(nickname: string | null = null) {
        super();
        this.nickname = nickname;
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
        return 1774907609;
    }
}

export class OnlineNotifierData extends BasePacket implements ProfileTypes.IOnlineNotifierData {
    isOnline: boolean = false;
    server: number = 0;
    nickname: string = "";

    constructor(isOnline?: boolean, server?: number, nickname?: string) {
        super();
        if (isOnline !== undefined) this.isOnline = isOnline;
        if (server !== undefined) this.server = server;
        if (nickname) this.nickname = nickname;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.isOnline = reader.readUInt8() === 1;
        this.server = reader.readInt32BE();
        this.nickname = reader.readOptionalString() ?? "";
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeUInt8(this.isOnline ? 1 : 0);
        writer.writeInt32BE(this.server);
        writer.writeOptionalString(this.nickname);
        return writer.getBuffer();
    }
    static getId(): number {
        return 2041598093;
    }
}

export class RankNotifierData extends BasePacket implements ProfileTypes.IRankNotifierData {
    rank: number = 0;
    nickname: string = "";

    constructor(rank?: number, nickname?: string) {
        super();
        if (rank !== undefined) this.rank = rank;
        if (nickname) this.nickname = nickname;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.rank = reader.readInt32BE();
        this.nickname = reader.readOptionalString() ?? "";
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.rank);
        writer.writeOptionalString(this.nickname);
        return writer.getBuffer();
    }
    static getId(): number {
        return -962759489;
    }
}

export class PremiumNotifierData extends BasePacket implements ProfileTypes.IPremiumNotifierData {
    premiumTimeLeftInSeconds: number = 0;
    nickname: string = "";

    constructor(premiumTimeLeftInSeconds?: number, nickname?: string) {
        super();
        if (premiumTimeLeftInSeconds !== undefined) this.premiumTimeLeftInSeconds = premiumTimeLeftInSeconds;
        if (nickname) this.nickname = nickname;
    }

    read(buffer: Buffer): void {
        const reader = new BufferReader(buffer);
        this.premiumTimeLeftInSeconds = reader.readInt32BE();
        this.nickname = reader.readOptionalString() ?? "";
    }

    write(): Buffer {
        const writer = new BufferWriter();
        writer.writeInt32BE(this.premiumTimeLeftInSeconds);
        writer.writeOptionalString(this.nickname);
        return writer.getBuffer();
    }
    static getId(): number {
        return -2069508071;
    }
}