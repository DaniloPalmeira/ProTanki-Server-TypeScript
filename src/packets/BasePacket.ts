import { IPacket } from "./IPacket";

export abstract class BasePacket implements IPacket {
    abstract read(buffer: Buffer): void;
    abstract write(): Buffer;

    public toString(): string {
        const className = this.constructor.name;
        const properties = Object.entries(this).map(([key, value]) => {
            if (key.toLowerCase().includes("password") && typeof value === "string") {
                return `${key}=${"*".repeat(value.length)}`;
            }

            if (value instanceof Buffer) {
                return `${key}=Buffer(length=${value.length})`;
            }

            if (typeof value === "object" && value !== null) {
                try {
                    const json = JSON.stringify(value);
                    return `${key}=${json.length > 75 ? json.substring(0, 72) + "..." : json}`;
                } catch (e) {
                    return `${key}=[Circular]`;
                }
            }

            return `${key}=${value}`;
        });

        return `${className}(${properties.join(", ")})`;
    }

    static getId(): number {
        throw new Error("Method 'getId()' must be implemented.");
    }

    getId(): number {
        return (this.constructor as typeof BasePacket).getId();
    }
}