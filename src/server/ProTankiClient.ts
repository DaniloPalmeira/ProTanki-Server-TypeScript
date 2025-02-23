import * as net from "net";
import { ProTankiServer } from "./ProTankiServer";
import { ClientState } from "../types/ClientState";
import { EncryptionService } from "../crypto/EncryptionService";
import { IClientOptions } from "../types/IClientOptions";
import { PacketFactory } from "../packets/PacketFactory";
import { IPacket } from "../packets/interfaces/IPacket";
import Protection from "../packets/implementations/Protection";

export class ProTankiClient {
  socket: net.Socket;
  server: ProTankiServer;
  state: ClientState;
  encryptionService: EncryptionService;
  rawDataReceived: Buffer = Buffer.alloc(0);
  inviteCodeTyped: string = "";
  language: string = "";

  constructor({ socket, server }: IClientOptions) {
    this.socket = socket;
    this.server = server;
    this.state = "lobby";
    this.server.addClient(this);
    this.encryptionService = new EncryptionService();
    this.socket.on("data", this.handleData.bind(this));
    this.socket.on("close", this.handleClose.bind(this));

    this.sendPacket(new Protection(this.encryptionService.obtainKeys()), false);
  }

  handleData(data: Buffer): void {
    if (data) {
      this.rawDataReceived = Buffer.concat([this.rawDataReceived, data]);
    }

    while (this.rawDataReceived.length >= 8) {
      const packetSize = this.rawDataReceived.readInt32BE(0);
      if (this.rawDataReceived.length < packetSize) {
        break;
      }

      const packetId = this.rawDataReceived.readInt32BE(4);
      const packetData = this.rawDataReceived.slice(8, packetSize);

      console.log(
        `Received packet of size: ${packetSize}, with ID: ${packetId}`
      );
      this.processPacket(packetId, packetData);

      this.rawDataReceived = this.rawDataReceived.slice(packetSize);
    }
  }

  processPacket(packetID: number, packetData: Buffer): void {
    console.log(`Processing packet with ID: ${packetID}`);

    const decryptedPacket = this.encryptionService.decrypt(packetData);

    const packetClass = PacketFactory(packetID);
    if (packetClass) {
      packetClass.read(decryptedPacket);
      console.log(packetClass.toString());
      packetClass.run(this.server, this);
    } else {
      console.log(`No packet found for ID: ${packetID}`);
    }
  }

  handleClose(): void {
    console.log("Connection closed");
    this.server.removeClient(this);
  }

  sendPacket(packet: IPacket, encrypt: boolean = true): void {
    const rawBuffer = packet.write();
    const packetId = packet.getId();

    const finalBuffer = encrypt
      ? this.encryptionService.encrypt(rawBuffer)
      : rawBuffer;
    const packetLength = finalBuffer.length + 8;

    const packetBuffer = Buffer.alloc(packetLength);
    packetBuffer.writeInt32BE(packetLength, 0);
    packetBuffer.writeInt32BE(packetId, 4);
    finalBuffer.copy(packetBuffer, 8);

    console.log(
      `Sending packet (ID: ${packetId}, Size: ${packetLength}, Encrypted: ${encrypt})`
    );

    this.socket.write(packetBuffer);
  }
}
