import { IEncryptionKeys } from "../types/IEncryptionKeys";
import { ENCRYPTION_CONSTANTS } from "../config/constants";

export class EncryptionService {
  private encryptionKeys: IEncryptionKeys;

  constructor() {
    this.encryptionKeys = {
      decrypt_position: 0,
      encrypt_position: 0,
      encryptionLenght: ENCRYPTION_CONSTANTS.KEY_LENGTH,
      decrypt_keys: new Array(ENCRYPTION_CONSTANTS.KEY_LENGTH).fill(0),
      encrypt_keys: new Array(ENCRYPTION_CONSTANTS.KEY_LENGTH).fill(0),
      keyList: [],
    };
    this.initializeKeys();
  }

  private initializeKeys(): void {
    this.encryptionKeys.keyList = this.generateKeys();
    this.setCryptoKeys();
  }

  private generateKeys(): number[] {
    const keys: number[] = [];
    for (let i = 0; i < 4; i++) {
      keys.push(Math.floor(Math.random() * -120) - 1);
    }
    return keys;
  }

  /**
   * Sets the encryption and decryption keys based on the key list.
   */
  private setCryptoKeys(): void {
    const base = this.encryptionKeys.keyList.reduce((acc, key) => acc ^ key, 0);

    for (let i = 0; i < ENCRYPTION_CONSTANTS.KEY_LENGTH; i++) {
      const key = base ^ (i << 3);
      this.encryptionKeys.encrypt_keys[i] = key;
      this.encryptionKeys.decrypt_keys[i] = key ^ ENCRYPTION_CONSTANTS.DECRYPT_XOR_VALUE;
    }
  }

  public obtainKeys(): number[] {
    return [...this.encryptionKeys.keyList];
  }

  public decrypt(packet: Buffer): Buffer {
    const decryptedPacket = Buffer.from(packet);

    for (let i = 0; i < decryptedPacket.length; i++) {
      const byteToDecrypt = decryptedPacket[i];
      const pos = this.encryptionKeys.decrypt_position;
      this.encryptionKeys.decrypt_keys[pos] ^= byteToDecrypt;
      decryptedPacket[i] = this.encryptionKeys.decrypt_keys[pos];
      this.encryptionKeys.decrypt_position ^= this.encryptionKeys.decrypt_keys[pos] & ENCRYPTION_CONSTANTS.POSITION_MASK;
    }
    return decryptedPacket;
  }

  public encrypt(packet: Buffer): Buffer {
    const encryptedPacket = Buffer.from(packet);

    for (let i = 0; i < encryptedPacket.length; i++) {
      const byteToEncrypt = encryptedPacket[i];
      encryptedPacket[i] = byteToEncrypt ^ this.encryptionKeys.encrypt_keys[this.encryptionKeys.encrypt_position];
      this.encryptionKeys.encrypt_keys[this.encryptionKeys.encrypt_position] = byteToEncrypt;
      this.encryptionKeys.encrypt_position ^= byteToEncrypt & ENCRYPTION_CONSTANTS.POSITION_MASK;
    }
    return encryptedPacket;
  }
}