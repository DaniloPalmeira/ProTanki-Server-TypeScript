import { IEmpty } from "@/packets/interfaces/IEmpty";
import { IPacket } from "@/packets/interfaces/IPacket";

export interface ISystemMessage extends IPacket {
    text: string | null;
}

export interface IPing extends IEmpty { }
export interface IPong extends IEmpty { }