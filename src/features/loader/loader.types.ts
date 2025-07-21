import { IEmpty } from "@/packets/interfaces/IEmpty";
import { IPacket } from "@/packets/interfaces/IPacket";

export interface IRequestNextTip extends IEmpty { }

export interface ISetLoadingScreenImage extends IPacket {
    resourceImageIdLow: number;
}

export interface IResourceCallback extends IPacket {
    callbackId: number;
}