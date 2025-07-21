import { IPacket } from "@/packets/interfaces/IPacket";

export interface ISocialNetwork extends IPacket {
    socialNetworkParams: Array<Array<String>>;
}