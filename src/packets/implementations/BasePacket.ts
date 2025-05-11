import { IPacket } from "../interfaces/IPacket";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ProTankiClient } from "../../server/ProTankiClient";

export abstract class BasePacket implements IPacket {
  abstract getId(): number;
  abstract read(buffer: Buffer): void;
  abstract write(): Buffer;
  abstract run(server: ProTankiServer, client: ProTankiClient): void | Promise<void>;
  abstract toString(): string;

  /**
   * Reads a string from the buffer at the specified offset.
   * @param buffer - The buffer to read from.
   * @param offset - The starting offset in the buffer.
   * @returns An object containing the read string and the new offset.
   * @throws {Error} If the buffer is invalid or the string length is negative.
   */
  protected readString(buffer: Buffer, offset: number): { value: string; newOffset: number } {
    this.validateBuffer(buffer, offset, 1);
    const isEmpty = buffer.readInt8(offset) === 1;
    if (isEmpty) {
      return { value: "", newOffset: offset + 1 };
    }
    this.validateBuffer(buffer, offset + 1, 4);
    const length = buffer.readInt32BE(offset + 1);
    if (length < 0) {
      throw new Error("Invalid string length");
    }
    this.validateBuffer(buffer, offset + 5, length);
    const value = buffer.toString("utf8", offset + 5, offset + 5 + length);
    return { value, newOffset: offset + 5 + length };
  }

  /**
   * Writes a string to a buffer.
   * @param value - The string to write.
   * @returns A buffer containing the encoded string.
   */
  protected writeString(value: string): Buffer {
    if (!value) {
      return Buffer.from([1]); // Empty string
    }
    const stringBuffer = Buffer.from(value, "utf8");
    const buffer = Buffer.alloc(5 + stringBuffer.length);
    buffer.writeInt8(0, 0); // Non-empty string
    buffer.writeInt32BE(stringBuffer.length, 1);
    stringBuffer.copy(buffer, 5);
    return buffer;
  }

  /**
   * Validates that the buffer has enough data starting from the offset.
   * @param buffer - The buffer to validate.
   * @param offset - The starting offset.
   * @param requiredLength - The required length of data.
   * @throws {Error} If the buffer is too short.
   */
  protected validateBuffer(buffer: Buffer, offset: number, requiredLength: number): void {
    if (offset + requiredLength > buffer.length) {
      throw new Error(`Buffer too short: required ${requiredLength} bytes from offset ${offset}`);
    }
  }

  protected readEmpty(buffer: Buffer): void {
    // Método vazio para pacotes sem dados
  }

  protected writeEmpty(): Buffer {
    return Buffer.alloc(0);
  }
}