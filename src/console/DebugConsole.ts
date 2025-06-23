import readline from "readline";
import { ProTankiServer } from "../server/ProTankiServer";
import logger from "../utils/Logger";
import RawPacket from "../packets/implementations/dev/RawPacket";

export class DebugConsole {
  private server: ProTankiServer;
  private rl: readline.Interface;

  constructor(server: ProTankiServer) {
    this.server = server;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });
  }

  public start(): void {
    logger.info("Debug console started. Type 'help' for a list of commands.");
    this.rl.prompt();

    this.rl
      .on("line", (line) => {
        this.handleCommand(line.trim()).catch((err) => {
          logger.error("Error executing console command", { error: err });
        });
        this.rl.prompt();
      })
      .on("close", () => {
        logger.info("Exiting server...");
        process.exit(0);
      });
  }

  private async handleCommand(line: string): Promise<void> {
    const parts = line.split(" ").filter((p) => p);
    const command = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        this.showHelp();
        break;
      case "send":
        this.handleSendCommand(args);
        break;
      case "list":
        this.handleListCommand();
        break;
      case "exit":
        this.rl.close();
        break;
      default:
        if (command) {
          console.log(`Unknown command: "${command}". Type 'help' for a list of commands.`);
        }
        break;
    }
  }

  private showHelp(): void {
    console.log("Available commands:");
    console.log("  send <all|ip> <packetId> [payloadHex] - Send a packet.");
    console.log("  list                                 - List connected clients.");
    console.log("  help                                 - Show this help message.");
    console.log("  exit                                 - Shutdown the server.");
  }

  private handleListCommand(): void {
    const clients = this.server.getClients();
    if (clients.length === 0) {
      console.log("No clients connected.");
      return;
    }

    console.log("Connected clients:");
    clients.forEach((client) => {
      console.log(`- ${client.getRemoteAddress()}`);
    });
  }

  private handleSendCommand(args: string[]): void {
    if (args.length < 2) {
      console.log("Usage: send <all|ip> <packetId> [payloadHex]");
      return;
    }

    const target = args[0];
    const packetId = parseInt(args[1], 10);
    const payloadHex = args[2] || "";

    if (isNaN(packetId)) {
      console.log("Error: Invalid packetId. Must be a number.");
      return;
    }

    let payload: Buffer;
    try {
      payload = Buffer.from(payloadHex, "hex");
    } catch (error) {
      console.log("Error: Invalid hexadecimal payload.");
      return;
    }

    const packet = new RawPacket(packetId, payload);

    if (target.toLowerCase() === "all") {
      this.server.broadcastToLobby(packet);
      console.log(`Packet ${packetId} sent to all clients.`);
      return;
    }

    const client = this.server.findClientByIp(target);
    if (client) {
      client.sendPacket(packet);
      console.log(`Packet ${packetId} sent to ${target}.`);
    } else {
      console.log(`Error: Client with IP ${target} not found.`);
    }
  }
}
