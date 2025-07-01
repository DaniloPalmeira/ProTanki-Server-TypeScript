import { IPacket } from "./IPacket";

export interface ITankSpecificationData {
  nickname: string | null;
  speed: number;
  maxTurnSpeed: number;
  turretTurnSpeed: number;
  acceleration: number;
  isPro: boolean;
}

export interface ITankSpecification extends IPacket, ITankSpecificationData {}
