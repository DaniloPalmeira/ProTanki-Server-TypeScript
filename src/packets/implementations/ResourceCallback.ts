import { CALLBACK } from "../../config/constants";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IResourceCallback } from "../interfaces/IResourceCallback";
import { BasePacket } from "./BasePacket";
import { LoginWorkflow } from "../../workflows/LoginWorkflow";

export default class ResourceCallback extends BasePacket implements IResourceCallback {
  callbackId: number;

  constructor(callbackId: number = 0) {
    super();
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
    if (this.callbackId === CALLBACK.LOGIN_FORM) {
      LoginWorkflow.initializeLoginForm(client, server);
    }
  }

  toString(): string {
    return `ResourceCallback(callbackId=${this.callbackId})`;
  }

  getId(): number {
    return -82304134;
  }
}
