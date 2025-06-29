import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import ResourceCallback from "../../packets/implementations/ResourceCallback";
import { CALLBACK } from "../../config/constants";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";
import { GarageWorkflow } from "../../workflows/GarageWorkflow";

export default class ResourceCallbackHandler implements IPacketHandler<ResourceCallback> {
  public readonly packetId = ResourceCallback.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ResourceCallback): void {
    switch (packet.callbackId) {
      case CALLBACK.LOGIN_FORM:
        LoginWorkflow.initializeLoginForm(client, server);
        break;
      case CALLBACK.GARAGE_DATA:
        GarageWorkflow.initializeGarage(client, server);
        break;
    }
  }
}
