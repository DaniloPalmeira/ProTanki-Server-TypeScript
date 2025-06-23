import readline from "readline";
import { ProTankiServer } from "../server/ProTankiServer";
import logger, { consoleTransport } from "../utils/Logger";
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
    if (consoleTransport) {
      consoleTransport.on("log", (formattedMessage: string) => {
        this.printLogMessage(formattedMessage);
      });
      logger.info("Debug console started. Type 'help' for a list of commands.");
    }

    this.rl.prompt();

    this.rl
      .on("line", (line) => {
        this.handleCommand(line.trim()).catch((err) => {
          this.printLogMessage(`Error executing console command: ${err.message}`);
        });
        this.rl.prompt();
      })
      .on("close", () => {
        logger.info("Exiting server...");
        process.exit(0);
      });
  }

  private printLogMessage(message: string): void {
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(message + "\n");
    this.rl.prompt(true);
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
    console.log("\nAvailable commands:");
    console.log("  send <all|ip> <packetId> [payloadHex] - Send a packet.");
    console.log("  list                                 - List connected clients.");
    console.log("  help                                 - Show this help message.");
    console.log("  exit                                 - Shutdown the server.\n");
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
      this.server.broadcastToAll(packet);
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
