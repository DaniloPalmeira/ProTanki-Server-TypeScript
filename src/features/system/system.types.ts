import { IPacket } from "@/packets/interfaces/IPacket";

export interface ISystemMessage extends IPacket {
    text: string | null;
}