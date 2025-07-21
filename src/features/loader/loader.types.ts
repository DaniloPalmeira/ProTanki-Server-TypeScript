import { IEmpty } from "@/packets/IEmpty";
import { IPacket } from "@/packets/IPacket";

export interface IRequestNextTip extends IEmpty { }

export interface ISetLoadingScreenImage extends IPacket {
    resourceImageIdLow: number;
}

export interface IResourceCallback extends IPacket {
    callbackId: number;
}

export interface IDependency {
    idhigh: string;
    idlow: number;
    versionhigh: string;
    versionlow: number;
    lazy: boolean;
    fileNames?: string[];
    alpha?: boolean;
    type: number;
    weight?: number;
    height?: number;
    numFrames?: number;
    fps?: number;
}

export interface ILoadDependencies extends IPacket {
    dependencies: { resources: IDependency[] };
    callbackId: number;
}

export interface IHideLoader extends IEmpty { }