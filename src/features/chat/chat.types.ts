import { IPacket } from "@/packets/interfaces/IPacket";
import { ChatModeratorLevel } from "@/models/enums/ChatModeratorLevel";

export interface ISendChatMessage extends IPacket {
    targetNickname: string | null;
    message: string | null;
}

export interface IChatMessageUser {
    moderatorLevel: ChatModeratorLevel;
    ip: string | null;
    rank: number;
    uid: string;
}

export interface IChatMessageData {
    source: IChatMessageUser | null;
    target: IChatMessageUser | null;
    message: string;
    isSystem: boolean;
    isWarning: boolean;
}

export interface IChatHistory extends IPacket {
    messages: IChatMessageData[];
}

export interface IChatPropertiesProps {
    admin: boolean;
    antifloodEnabled: boolean;
    bufferSize: number;
    chatEnabled: boolean;
    chatModeratorLevel: ChatModeratorLevel;
    linksWhiteList: string[];
    minChar: number;
    minWord: number;
    selfName: string;
    showLinks: boolean;
    typingSpeedAntifloodEnabled: boolean;
}

export interface IChatProperties extends IChatPropertiesProps, IPacket { }

export interface IAntifloodSettings extends IPacket {
    charDelayFactor: number;
    messageBaseDelay: number;
}