import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IResourceCallback } from "../interfaces/IResourceCallback";
import HideLoader from "./HideLoader";
import InviteEnabled from "./InviteEnabled";
import Registration from "./Registration";

export default class ResourceCallback implements IResourceCallback {
  callbackId: number;

  constructor(callbackId: number) {
    this.callbackId = callbackId;
  }

  read(buffer: Buffer): void {
    this.callbackId = buffer.readInt32BE(0);
  }

  write(): Buffer {
    const packet = Buffer.alloc(4);
    packet.writeInt32BE(this.callbackId, 0);
    return packet;
  }

  run(server: ProTankiServer, client: ProTankiClient): void {
    if (this.callbackId === 3) {
      client.sendPacket(new InviteEnabled(server.getNeedInviteCode()));
      const loginForm = server.getLoginForm();
      client.sendPacket(
        new Registration(
          loginForm.bgResource,
          loginForm.enableRequiredEmail,
          loginForm.maxPasswordLength,
          loginForm.minPasswordLength
        )
      );
      client.sendPacket(new HideLoader());
    }
  }

  toString(): string {
    return `ResourceCallback(callbackId: ${this.callbackId})`;
  }

  getId(): number {
    return -82304134;
  }
}
