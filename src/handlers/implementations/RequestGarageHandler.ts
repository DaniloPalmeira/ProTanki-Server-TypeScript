import RequestGaragePacket from "../../packets/implementations/RequestGaragePacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { GarageWorkflow } from "../../workflows/GarageWorkflow";
import { IPacketHandler } from "../IPacketHandler";

export default class RequestGarageHandler implements IPacketHandler<RequestGaragePacket> {
  public readonly packetId = RequestGaragePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestGaragePacket): Promise<void> {
    const state = client.getState();

    if (client.currentBattle) {
      if (state === "battle") {
        GarageWorkflow.enterBattleGarageView(client, server);
      } else if (state === "battle_garage") {
        GarageWorkflow.returnToBattleView(client, server);
      } else if (state === "battle_lobby") {
        GarageWorkflow.transitionFromLobbyToGarage(client, server);
      }
    } else {
      if (state === "chat_lobby") {
        await GarageWorkflow.enterGarage(client, server);
      }
    }
  }
}
