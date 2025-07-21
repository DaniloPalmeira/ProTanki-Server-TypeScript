import { IPacket } from "@/packets/packet.interfaces";

export interface IEncryptionKeys {
    encryptionLenght: number;
    encrypt_keys: number[];
    decrypt_keys: number[];
    encrypt_position: number;
    decrypt_position: number;
    keyList: number[];
}

export interface IProtection extends IPacket {
    keys: Array<number>;
}