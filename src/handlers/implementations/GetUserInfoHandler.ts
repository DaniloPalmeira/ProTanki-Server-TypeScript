import { LobbyWorkflow } from "@/features/lobby/lobby.workflow";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import GetUserInfo from "../../packets/implementations/GetUserInfo";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";

export default class GetUserInfoHandler implements IPacketHandler<GetUserInfo> {
  public readonly packetId = GetUserInfo.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: GetUserInfo): Promise<void> {
    if (packet.nickname) {
      await LobbyWorkflow.sendFullUserInfo(client, server, packet.nickname);
    }
  }
}