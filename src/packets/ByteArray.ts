enum Endian {
  BIG_ENDIAN = "big",
  LITTLE_ENDIAN = "little",
}

class ByteArray {
  private _buffer: Buffer;
  private _position: number = 0;
  private _limit: number;
  private _length: number; // Nova propriedade para rastrear o tamanho dos dados válidos
  private _endian: Endian = Endian.BIG_ENDIAN;

  constructor(bufferOrSize?: Buffer | number) {
    if (Buffer.isBuffer(bufferOrSize)) {
      // Caso um Buffer seja fornecido
      this._buffer = bufferOrSize;
      this._limit = bufferOrSize.length;
      this._length = bufferOrSize.length; // Define length como o tamanho do buffer
      this._position = 0;
    } else {
      // Caso seja um número ou undefined
      const initialSize =
        typeof bufferOrSize === "number" ? bufferOrSize : 1024;
      if (initialSize < 0) {
        throw new Error("Initial size must be non-negative");
      }
      this._buffer = Buffer.alloc(initialSize);
      this._limit = initialSize;
      this._length = 0; // Começa com length 0 para buffer vazio
      this._position = 0;
    }
  }

  // Getters e setters para position
  get position(): number {
    return this._position;
  }

  set position(value: number) {
    if (value < 0 || value > this._limit) {
      throw new Error("Position out of bounds");
    }
    this._position = value;
  }

  // Getters e setters para endian
  get endian(): Endian {
    return this._endian;
  }

  set endian(value: Endian) {
    this._endian = value;
  }

  get length(): number {
    return this._length; // Retorna o tamanho real dos dados válidos
  }

  get bytesAvailable(): number {
    return this._length - this._position; // Bytes disponíveis para leitura
  }

  // Redimensiona o buffer se necessário
  private ensureCapacity(required: number): void {
    if (this._position + required <= this._limit) {
      return;
    }
    const newLimit = Math.max(this._limit * 2, this._position + required);
    const newBuffer = Buffer.alloc(newLimit);
    this._buffer.copy(newBuffer, 0, 0, this._length); // Copia apenas os dados válidos
    this._buffer = newBuffer;
    this._limit = newLimit;
  }

  // Métodos de escrita (ajustados para atualizar _length)
  writeByte(value: number): void {
    this.ensureCapacity(1);
    this._buffer.writeInt8(value, this._position);
    this._position += 1;
    this._length = Math.max(this._length, this._position); // Atualiza length
  }

  writeUnsignedByte(value: number): void {
    this.ensureCapacity(1);
    this._buffer.writeUInt8(value, this._position);
    this._position += 1;
    this._length = Math.max(this._length, this._position);
  }

  writeShort(value: number): void {
    this.ensureCapacity(2);
    if (this._endian === Endian.BIG_ENDIAN) {
      this._buffer.writeInt16BE(value, this._position);
    } else {
      this._buffer.writeInt16LE(value, this._position);
    }
    this._position += 2;
    this._length = Math.max(this._length, this._position);
  }

  writeUnsignedShort(value: number): void {
    this.ensureCapacity(2);
    if (this._endian === Endian.BIG_ENDIAN) {
      this._buffer.writeUInt16BE(value, this._position);
    } else {
      this._buffer.writeUInt16LE(value, this._position);
    }
    this._position += 2;
    this._length = Math.max(this._length, this._position);
  }

  writeInt(value: number): void {
    this.ensureCapacity(4);
    if (this._endian === Endian.BIG_ENDIAN) {
      this._buffer.writeInt32BE(value, this._position);
    } else {
      this._buffer.writeInt32LE(value, this._position);
    }
    this._position += 4;
    this._length = Math.max(this._length, this._position);
  }

  writeUnsignedInt(value: number): void {
    this.ensureCapacity(4);
    if (this._endian === Endian.BIG_ENDIAN) {
      this._buffer.writeUInt32BE(value, this._position);
    } else {
      this._buffer.writeUInt32LE(value, this._position);
    }
    this._position += 4;
    this._length = Math.max(this._length, this._position);
  }

  writeFloat(value: number): void {
    this.ensureCapacity(4);
    if (this._endian === Endian.BIG_ENDIAN) {
      this._buffer.writeFloatBE(value, this._position);
    } else {
      this._buffer.writeFloatLE(value, this._position);
    }
    this._position += 4;
    this._length = Math.max(this._length, this._position);
  }

  writeDouble(value: number): void {
    this.ensureCapacity(8);
    if (this._endian === Endian.BIG_ENDIAN) {
      this._buffer.writeDoubleBE(value, this._position);
    } else {
      this._buffer.writeDoubleLE(value, this._position);
    }
    this._position += 8;
    this._length = Math.max(this._length, this._position);
  }

  writeUTF(value: string): void {
    const utf8Buffer = Buffer.from(value, "utf8");
    this.writeUnsignedShort(utf8Buffer.length);
    this.writeBytes(utf8Buffer);
  }

  writeString(value: string = ""): void {
    const stringSize = value.length;
    const utf8Buffer = Buffer.from(value, "utf8");

    if (stringSize > 0) {
      this.writeByte(0); // isEmpty
      this.writeInt(stringSize);
      this.writeBytes(utf8Buffer);
    } else {
      this.writeByte(1); // isEmpty
    }
  }

  writeBytes(bytes: Buffer, offset: number = 0, length: number = 0): void {
    if (!Buffer.isBuffer(bytes)) {
      throw new Error("Input must be a Buffer");
    }
    length = length || bytes.length - offset;
    if (offset < 0 || length < 0 || offset + length > bytes.length) {
      throw new Error("Invalid offset or length");
    }
    this.ensureCapacity(length);
    bytes.copy(this._buffer, this._position, offset, offset + length);
    this._position += length;
    this._length = Math.max(this._length, this._position);
  }

  // Métodos de leitura (ajustados para usar _length)
  readByte(): number {
    if (this._position + 1 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value = this._buffer.readInt8(this._position);
    this._position += 1;
    return value;
  }

  readUnsignedByte(): number {
    if (this._position + 1 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value = this._buffer.readUInt8(this._position);
    this._position += 1;
    return value;
  }

  readShort(): number {
    if (this._position + 2 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value =
      this._endian === Endian.BIG_ENDIAN
        ? this._buffer.readInt16BE(this._position)
        : this._buffer.readInt16LE(this._position);
    this._position += 2;
    return value;
  }

  readUnsignedShort(): number {
    if (this._position + 2 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value =
      this._endian === Endian.BIG_ENDIAN
        ? this._buffer.readUInt16BE(this._position)
        : this._buffer.readUInt16LE(this._position);
    this._position += 2;
    return value;
  }

  readInt(): number {
    if (this._position + 4 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value =
      this._endian === Endian.BIG_ENDIAN
        ? this._buffer.readInt32BE(this._position)
        : this._buffer.readInt32LE(this._position);
    this._position += 4;
    return value;
  }

  readUnsignedInt(): number {
    if (this._position + 4 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value =
      this._endian === Endian.BIG_ENDIAN
        ? this._buffer.readUInt32BE(this._position)
        : this._buffer.readUInt32LE(this._position);
    this._position += 4;
    return value;
  }

  readFloat(): number {
    if (this._position + 4 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value =
      this._endian === Endian.BIG_ENDIAN
        ? this._buffer.readFloatBE(this._position)
        : this._buffer.readFloatLE(this._position);
    this._position += 4;
    return value;
  }

  readDouble(): number {
    if (this._position + 8 > this._length) {
      throw new Error("Not enough bytes to read");
    }
    const value =
      this._endian === Endian.BIG_ENDIAN
        ? this._buffer.readDoubleBE(this._position)
        : this._buffer.readDoubleLE(this._position);
    this._position += 8;
    return value;
  }

  readUTF(): string {
    const length = this.readUnsignedShort();
    if (this._position + length > this._length) {
      throw new Error("Not enough bytes to read UTF string");
    }
    const value = this._buffer.toString(
      "utf8",
      this._position,
      this._position + length
    );
    this._position += length;
    return value;
  }

  readString(): string {
    let value = "";
    const isEmpty = this.readByte();
    if (!isEmpty) {
      const length = this.readInt();
      if (this._position + length > this.length) {
        throw new Error("Not enough bytes to read UTF string");
      }
      value = this._buffer.toString(
        "utf8",
        this._position,
        this._position + length
      );
      this._position += length;
    }
    return value;
  }

  readBytes(length: number): Buffer {
    if (length < 0 || this._position + length > this._length) {
      throw new Error("Invalid length or not enough bytes to read");
    }
    const result = this._buffer.subarray(
      this._position,
      this._position + length
    );
    this._position += length;
    return result;
  }

  // Métodos utilitários
  clear(): void {
    this._buffer = Buffer.alloc(this._limit);
    this._position = 0;
    this._length = 0; // Reseta length
  }

  toBuffer(): Buffer {
    return this._buffer.subarray(0, this._length); // Retorna apenas os dados válidos
  }
}

export default ByteArray;
