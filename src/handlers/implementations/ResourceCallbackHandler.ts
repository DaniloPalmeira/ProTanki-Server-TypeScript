import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import ResourceCallback from "../../packets/implementations/ResourceCallback";
import { CALLBACK } from "../../config/constants";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";

export default class ResourceCallbackHandler implements IPacketHandler<ResourceCallback> {
  public readonly packetId = ResourceCallback.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: ResourceCallback): void {
    if (packet.callbackId === CALLBACK.LOGIN_FORM) {
      LoginWorkflow.initializeLoginForm(client, server);
    }
  }
}
