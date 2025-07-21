import { IPacket } from "@/packets/IPacket";

export interface ISocialNetwork extends IPacket {
    socialNetworkParams: Array<Array<String>>;
}