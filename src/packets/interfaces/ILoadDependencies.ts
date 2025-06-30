import { IPacket } from "./IPacket";

export interface IDependency {
  idhigh: string;
  idlow: number;
  versionhigh: string;
  versionlow: number;
  lazy: boolean;
  fileNames?: string[];
  alpha?: boolean;
  type: number;
  width?: number;
  height?: number;
  numFrames?: number;
  fps?: number;
}

export interface ILoadDependencies extends IPacket {
  dependencies: { resources: IDependency[] };
  callbackId: number;
}
