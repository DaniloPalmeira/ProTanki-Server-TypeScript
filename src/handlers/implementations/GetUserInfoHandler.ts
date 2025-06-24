import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import GetUserInfo from "../../packets/implementations/GetUserInfo";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";

export default class GetUserInfoHandler implements IPacketHandler<GetUserInfo> {
  public readonly packetId = GetUserInfo.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: GetUserInfo): Promise<void> {
    if (packet.nickname) {
      await LobbyWorkflow.sendFullUserInfo(client, server, packet.nickname);
    }
  }
}
