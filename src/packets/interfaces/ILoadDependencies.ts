import { IPacket } from "./IPacket";

export interface ILoadDependencies extends IPacket {
  dependencies: object;
  callbackId: number;
}
