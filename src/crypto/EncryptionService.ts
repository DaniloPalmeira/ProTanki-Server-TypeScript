import { IEncryptionKeys } from "../types/IEncryptionKeys";

export class EncryptionService {
  encryptionKeys: IEncryptionKeys = {
    decrypt_position: 0,
    encrypt_position: 0,
    encryptionLenght: 8,
    decrypt_keys: Array(8).fill(0),
    encrypt_keys: Array(8).fill(0),
    keyList: [],
  };

  constructor() {
    this.generateKeys();
    this.setCrypsKeys();
  }

  private generateKeys(): number[] {
    const keys: number[] = [];
    for (let i = 0; i < 4; i++) {
      const key = Math.floor(Math.random() * -120) - 1;
      keys.push(key);
    }
    this.encryptionKeys.keyList = keys;
    return keys;
  }

  private setCrypsKeys(): void {
    let base = 0;
    for (const key of this.encryptionKeys.keyList) {
      base ^= key;
    }
    for (let i = 0; i < this.encryptionKeys.encryptionLenght; i++) {
      const encryptionKey = base ^ (i << 3);
      const decryptionKey = encryptionKey ^ 87;

      this.encryptionKeys.encrypt_keys[i] = encryptionKey;
      this.encryptionKeys.decrypt_keys[i] = decryptionKey;
    }
  }

  obtainKeys(): Array<number> {
    return this.encryptionKeys.keyList;
  }

  decrypt(packet: Buffer): Buffer {
    const decryptedPacket = Buffer.from(packet);

    for (let i = 0; i < decryptedPacket.length; i++) {
      const byteToDecrypt = decryptedPacket[i];
      this.encryptionKeys.decrypt_keys[this.encryptionKeys.decrypt_position] ^=
        byteToDecrypt;
      decryptedPacket[i] =
        this.encryptionKeys.decrypt_keys[this.encryptionKeys.decrypt_position];
      this.encryptionKeys.decrypt_position ^=
        this.encryptionKeys.decrypt_keys[this.encryptionKeys.decrypt_position] &
        7;
    }
    return decryptedPacket;
  }

  encrypt(packet: Buffer): Buffer {
    const encryptedPacket = Buffer.from(packet);

    for (let i = 0; i < encryptedPacket.length; i++) {
      const byteToEncrypt = encryptedPacket[i];
      encryptedPacket[i] =
        byteToEncrypt ^
        this.encryptionKeys.encrypt_keys[this.encryptionKeys.encrypt_position];
      this.encryptionKeys.encrypt_keys[this.encryptionKeys.encrypt_position] =
        byteToEncrypt;
      this.encryptionKeys.encrypt_position ^= byteToEncrypt & 7;
    }
    return encryptedPacket;
  }
}
