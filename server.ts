import { ProTankiServer } from "./src/server/ProTankiServer";
import { ResourceServer } from "./src/server/ResourceServer";
import dotenv from "dotenv";
import { connectToDatabase, disconnectFromDatabase } from "./src/database";
import { DEFAULT_PORT } from "./src/config/constants";
import { UserService } from "./src/services/UserService";
import { ConfigService } from "./src/services/ConfigService";
import { ResourceManager } from "./src/utils/ResourceManager";
import logger from "./src/utils/Logger";
import fs from "fs";
import path from "path";
import { DebugConsole } from "./src/console/DebugConsole";
import { CommandService } from "./src/commands/CommandService";
import { InviteService } from "./src/services/InviteService";
import { ChatService } from "./src/services/ChatService";
import { PacketHandlerService } from "./src/handlers/PacketHandlerService";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

async function bootstrap() {
  logger.info("Starting server initialization");

  const commandService = new CommandService();
  const configService = new ConfigService();
  const userService = new UserService();
  const inviteService = new InviteService();
  const chatService = new ChatService(userService);
  const packetHandlerService = new PacketHandlerService();

  ResourceManager.loadResources();
  logger.info("Resource configurations loaded");

  await connectToDatabase();
  logger.info("Database connection established");

  const configPath = path.join(__dirname, "initial-config.json");
  const defaultConfigs = JSON.parse(fs.readFileSync(configPath, "utf8"));
  await configService.initializeDefaultConfigs(defaultConfigs);

  await configService.loadAndCacheConfigs();

  const server = new ProTankiServer(
    {
      port: PORT,
      maxClients: configService.getMaxClients(),
      needInviteCode: configService.getNeedInviteCode(),
      socialNetworks: configService.getSocialNetworksForServer(),
      loginForm: {
        bgResource: ResourceManager.getIdlowById("ui/login_background"),
        enableRequiredEmail: false,
        maxPasswordLength: 64,
        minPasswordLength: 3,
      },
    },
    {
      commandService,
      configService,
      userService,
      inviteService,
      chatService,
      packetHandlerService,
    }
  );

  const resourceServer = new ResourceServer();
  const debugConsole = new DebugConsole(server, userService);

  logger.info("Starting ProTanki and Resource servers");
  server.start();
  resourceServer.start();
  debugConsole.start();

  process.on("SIGTERM", async () => {
    logger.info("Received SIGTERM. Initiating graceful shutdown...");
    try {
      await server.stop();
      logger.info("ProTanki server stopped");

      await resourceServer.stop();
      logger.info("Resource server stopped");

      await disconnectFromDatabase();
      logger.info("Database connection closed");
    } catch (error) {
      logger.error("Error during graceful shutdown", { error });
      process.exit(1);
    } finally {
      logger.info("Flushing logs before shutdown");
      logger.on("finish", () => {
        logger.info("Logger flushed and closed");
        process.exit(0);
      });
      logger.end();
    }
  });
}

(async () => {
  try {
    await bootstrap();
  } catch (error) {
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error), stack: undefined };

    logger.error("Failed to bootstrap server", { error: errorDetails });
  }
})();
