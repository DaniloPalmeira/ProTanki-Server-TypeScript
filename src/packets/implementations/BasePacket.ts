import { IPacket } from "../interfaces/IPacket";
import { ProTankiServer } from "../../server/ProTankiServer";
import { ProTankiClient } from "../../server/ProTankiClient";

export abstract class BasePacket implements IPacket {
  abstract read(buffer: Buffer): void;
  abstract write(): Buffer;
  abstract toString(): string;

  // O método getId agora é estático na definição da classe
  static getId(): number {
    throw new Error("Method 'getId()' must be implemented.");
  }

  // A implementação da interface ainda precisa de um método de instância para satisfazer o contrato
  // mas a lógica principal usará o estático.
  getId(): number {
    return (this.constructor as typeof BasePacket).getId();
  }

  run(server: ProTankiServer, client: ProTankiClient): void | Promise<void> {}
}
