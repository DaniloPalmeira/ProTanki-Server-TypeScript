import { ProTankiServer } from "./src/server/ProTankiServer";
import { ResourceServer } from "./src/server/ResourceServer";
import dotenv from "dotenv";
import sequelize from "./src/database";
import { DEFAULT_MAX_CLIENTS, DEFAULT_PORT } from "./src/config/constants";
import { InviteService } from "./src/services/InviteService";
import { ResourceManager } from "./src/utils/ResourceManager";
import logger from "./src/utils/Logger";

// Carrega as variáveis de ambiente primeiro
dotenv.config();

// Inicializa o logger como a primeira ação
logger.info("Starting server initialization");

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;
const MAX_CLIENTS = process.env.MAX_CLIENTS
  ? parseInt(process.env.MAX_CLIENTS)
  : DEFAULT_MAX_CLIENTS;
const NEED_INVITE_CODE = process.env.NEED_INVITE_CODE === "true";

async function seedTestData() {
  try {
    // Gerar 5 códigos de convite de teste
    const testInviteCodes = [];
    for (let i = 0; i < 5; i++) {
      const code = await InviteService.createInviteCode();
      testInviteCodes.push(code);
    }
    logger.info("Códigos de convite de teste gerados", {
      codes: testInviteCodes,
    });
  } catch (error) {
    logger.error("Erro ao gerar dados de teste", { error });
  }
}

async function bootstrap() {
  try {
    // Carregar configurações de recursos
    logger.info("Loading resource configurations");
    ResourceManager.loadResources();

    logger.info("Attempting database connection");
    await sequelize.authenticate();
    logger.info("Conexão com PostgreSQL estabelecida");
    await sequelize.sync({ force: true }); // force: true apenas para desenvolvimento
    logger.info("Banco de dados sincronizado");

    // Inserir dados de teste
    logger.info("Seeding test data");
    await seedTestData();

    const server = new ProTankiServer({
      port: PORT,
      maxClients: MAX_CLIENTS,
      needInviteCode: NEED_INVITE_CODE,
      socialNetworks: [
        ["https://google.com", "google"],
        ["https://facebook.com", "facebook"],
        ["https://vk.com", "vkontakte"],
      ],
      loginForm: {
        bgResource: 122842,
        enableRequiredEmail: false,
        maxPasswordLength: 64,
        minPasswordLength: 3,
      },
    });

    // Iniciar o servidor de recursos
    const resourceServer = new ResourceServer();

    logger.info("Starting ProTanki and Resource servers");
    server.start();
    resourceServer.start();

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM. Initiating graceful shutdown...");
      try {
        // Para o servidor ProTanki
        logger.info("Stopping ProTanki server...");
        await server.stop();

        // Para o servidor de recursos
        logger.info("Stopping Resource server...");
        await resourceServer.stop();

        // Fecha a conexão com o banco de dados
        logger.info("Closing database connection...");
        await sequelize.close();

        // Finaliza o logger
        logger.info("Flushing logs before shutdown");
        await new Promise<void>((resolve) => {
          logger.on("finish", () => {
            logger.info("Logger flushed and closed");
            resolve();
          });
          logger.end();
        });

        logger.info("Shutdown completed successfully");
        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown", { error });
        // Garante que o logger seja finalizado mesmo em caso de erro
        await new Promise<void>((resolve) => {
          logger.on("finish", () => {
            logger.info("Logger flushed and closed due to shutdown error");
            resolve();
          });
          logger.end();
        });
        process.exit(1);
      }
    });
  } catch (error: unknown) {
    // Converte o erro para um objeto seguro para logging
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error), stack: undefined };
    logger.error("Erro ao iniciar o servidor", errorDetails);
    // Garante que o logger seja finalizado
    await new Promise<void>((resolve) => {
      logger.info("Flushing logs due to startup error");
      logger.on("finish", () => {
        logger.info("Logger flushed and closed due to startup error");
        resolve();
      });
      logger.end();
    });
    // Atraso adicional para garantir que os logs sejam gravados
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit(1);
  }
}

bootstrap();