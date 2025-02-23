export interface IServerOptions {
  port: number;
  maxClients: number;
  needInviteCode: boolean;
  socialNetworks: Array<string[]>;
}
