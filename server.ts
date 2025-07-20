import { ProTankiServer } from "@/server/ProTankiServer";
import { ResourceServer } from "@/server/ResourceServer";
import dotenv from "dotenv";
import { connectToDatabase, disconnectFromDatabase } from "@/database";
import { DEFAULT_PORT } from "@/config/constants";
import { UserService } from "@/shared/services/UserService";
import { ConfigService } from "@/services/ConfigService";
import { ResourceManager } from "@/utils/ResourceManager";
import logger from "@/utils/Logger";
import fs from "fs";
import path from "path";
import { DebugConsole } from "@/console/DebugConsole";
import { CommandService } from "@/features/chat/commands/command.service";
import { InviteService } from "@/services/InviteService";
import { ChatService } from "@/features/chat/chat.service";
import { PacketHandlerService } from "@/handlers/PacketHandlerService";
import { PacketService } from "@/packets/PacketService";
import { ShopService } from "@/services/ShopService";
import { RankService } from "@/services/RankService";
import { QuestService } from "@/services/QuestService";
import { BattleService } from "@/services/BattleService";
import { GarageService } from "@/services/GarageService";
import { FriendsService } from "@/features/friends/friends.service";
import { AuthService } from "@/features/authentication/auth.service";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

async function bootstrap() {
  logger.info("Starting server initialization");

  const commandService = new CommandService();
  const configService = new ConfigService();
  const rankService = new RankService();
  const userService = new UserService(rankService);
  const inviteService = new InviteService();
  const chatService = new ChatService(userService);
  const packetHandlerService = new PacketHandlerService();
  const packetService = new PacketService();
  const shopService = new ShopService();
  const questService = new QuestService();
  const garageService = new GarageService();
  const friendsService = new FriendsService(userService);
  const authService = new AuthService(userService);
  let battleService: BattleService;

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
    () => battleService,
    {
      commandService,
      configService,
      userService,
      inviteService,
      chatService,
      packetHandlerService,
      packetService,
      shopService,
      rankService,
      questService,
      garageService,
      friendsService,
      authService,
    }
  );

  battleService = new BattleService(server);

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