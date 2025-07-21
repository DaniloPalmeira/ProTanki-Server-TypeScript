import { IPacket } from "@/packets/packet.interfaces";

export interface ISocialNetwork extends IPacket {
    socialNetworkParams: Array<Array<String>>;
}