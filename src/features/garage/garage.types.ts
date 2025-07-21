import { IEmpty } from "@/packets/IEmpty";
import { IPacket } from "@/packets/IPacket";

export interface IBuyItem extends IPacket {
    itemId: string | null;
    quantity: number;
    price: number;
}

export interface IEquipItemRequest extends IPacket {
    itemId: string | null;
}

export interface IGarageItems extends IPacket {
    jsonData: string | null;
}

export interface IMountItem extends IPacket {
    itemId: string | null;
    unknown: boolean;
}

export interface IRequestGarage extends IEmpty { }

export interface IShopItems extends IPacket {
    jsonData: string | null;
}

export interface IUnloadGarage extends IEmpty { }