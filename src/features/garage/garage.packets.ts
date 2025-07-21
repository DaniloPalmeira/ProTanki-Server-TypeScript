import { BasePacket } from "@/packets/base.packet";
import { BufferReader } from "../../utils/buffer/buffer.reader";
import { BufferWriter } from "../../utils/buffer/buffer.writer";
import * as GarageTypes from "./garage.types";

export class BuyItemPacket extends BasePacket implements GarageTypes.IBuyItem {
    itemId: string | null = null;
    quantity: number = 0;
    price: number = 0;
    read(buffer: Buffer): void { const r = new BufferReader(buffer); this.itemId = r.readOptionalString(); this.quantity = r.readInt32BE(); this.price = r.readInt32BE(); }
    write(): Buffer { const w = new BufferWriter(); w.writeOptionalString(this.itemId); w.writeInt32BE(this.quantity); w.writeInt32BE(this.price); return w.getBuffer(); }
    static getId(): number { return -1961983005; }
}

export class EquipItemRequestPacket extends BasePacket implements GarageTypes.IEquipItemRequest {
    itemId: string | null = null;
    read(buffer: Buffer): void { this.itemId = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.itemId).getBuffer(); }
    static getId(): number { return -1505530736; }
}

export class GarageItemsPacket extends BasePacket implements GarageTypes.IGarageItems {
    jsonData: string | null;
    constructor(jsonData: string | null = null) { super(); this.jsonData = jsonData; }
    read(buffer: Buffer): void { this.jsonData = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.jsonData).getBuffer(); }
    static getId(): number { return -255516505; }
}

export class MountItemPacket extends BasePacket implements GarageTypes.IMountItem {
    itemId: string | null;
    unknown: boolean;
    constructor(itemId: string | null = null, unknown: boolean = false) { super(); this.itemId = itemId; this.unknown = unknown; }
    read(buffer: Buffer): void { const r = new BufferReader(buffer); this.itemId = r.readOptionalString(); this.unknown = r.readUInt8() === 1; }
    write(): Buffer { const w = new BufferWriter(); w.writeOptionalString(this.itemId); w.writeUInt8(this.unknown ? 1 : 0); return w.getBuffer(); }
    static getId(): number { return 2062201643; }
}

export class RequestGaragePacket extends BasePacket implements GarageTypes.IRequestGarage {
    read(buffer: Buffer): void { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId(): number { return -479046431; }
}

export class ShopItemsPacket extends BasePacket implements GarageTypes.IShopItems {
    jsonData: string | null;
    constructor(jsonData: string | null = null) { super(); this.jsonData = jsonData; }
    read(buffer: Buffer): void { this.jsonData = new BufferReader(buffer).readOptionalString(); }
    write(): Buffer { return new BufferWriter().writeOptionalString(this.jsonData).getBuffer(); }
    static getId(): number { return -300370823; }
}

export class UnloadGaragePacket extends BasePacket implements GarageTypes.IUnloadGarage {
    read(buffer: Buffer): void { }
    write(): Buffer { return new BufferWriter().getBuffer(); }
    static getId(): number { return 1211186637; }
}