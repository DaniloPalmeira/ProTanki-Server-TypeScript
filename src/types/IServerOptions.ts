import { IRegistration } from "@/features/authentication/auth.types";

export interface IServerOptions {
  port: number;
  maxClients: number;
  needInviteCode: boolean;
  socialNetworks: Array<string[]>;
  loginForm: IRegistration;
}