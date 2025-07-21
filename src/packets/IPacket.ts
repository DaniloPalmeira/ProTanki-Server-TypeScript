
export interface IPacket {
    [x: string]: any;
    read(buffer: Buffer): void;
    write(): Buffer;
    toString(): string;
    getId(): number;
}