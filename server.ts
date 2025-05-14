import { ProTankiServer } from "./src/server/ProTankiServer";
import { ResourceServer } from "./src/server/ResourceServer";
import dotenv from "dotenv";
import sequelize from "./src/database";
import { DEFAULT_MAX_CLIENTS, DEFAULT_PORT } from "./src/config/constants";
import { InviteService } from "./src/services/InviteService";
import { UserService } from "./src/services/UserService";
import { ConfigService } from "./src/services/ConfigService";
import { ResourceManager } from "./src/utils/ResourceManager";
import logger from "./src/utils/Logger";
import { WebSocketManager } from "./src/server/WebSocketManager";
import http from "http";
import fs from "fs";
import path from "path";

// Carrega as variáveis de ambiente primeiro
dotenv.config();

// Inicializa o logger como a primeira ação
logger.info("Starting server initialization");

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

function seedTestData(callback: (error?: Error) => void) {
  let codesGenerated = 0;
  const testInviteCodes: string[] = [];

  function createCode() {
    if (codesGenerated >= 5) {
      logger.info("Códigos de convite de teste gerados", {
        codes: testInviteCodes,
      });

      // Criar usuários de teste
      let usersCreated = 0;
      const testUsers = [
        { username: "player1", password: "password123", email: "player1@example.com" },
        { username: "player2", password: "password123", email: "player2@example.com" },
      ];

      function createUser() {
        if (usersCreated >= testUsers.length) {
          logger.info("Usuários de teste criados", {
            users: testUsers.map((u) => u.username),
          });
          return callback();
        }

        const userData = testUsers[usersCreated];
        UserService.createUser(userData, (error, user) => {
          if (error) {
            logger.error(`Erro ao criar usuário de teste ${userData.username}`, { error });
            return callback(error);
          }
          usersCreated++;
          createUser();
        });
      }

      createUser();
      return;
    }

    InviteService.createInviteCode((error, code) => {
      if (error) {
        logger.error("Erro ao gerar código de teste", { error });
        return callback(error);
      }
      testInviteCodes.push(code!);
      codesGenerated++;
      createCode();
    });
  }

  createCode();
}

// Funções utilitárias para converter promessas em callbacks
function authenticateSequelize(callback: (error: Error | null) => void) {
  sequelize.authenticate().then(() => callback(null)).catch((error: Error) => callback(error));
}

function syncSequelize(options: { force: boolean }, callback: (error: Error | null) => void) {
  sequelize.sync(options).then(() => callback(null)).catch((error: Error) => callback(error));
}

function closeSequelize(callback: (error: Error | null) => void) {
  sequelize.close().then(() => callback(null)).catch((error: Error) => callback(error));
}

function bootstrap() {
  try {
    // Carregar configurações de recursos
    logger.info("Loading resource configurations");
    ResourceManager.loadResources();

    logger.info("Attempting database connection");
    authenticateSequelize((err) => {
      if (err) {
        logger.error("Erro ao conectar ao PostgreSQL", { error: err });
        return shutdownWithError(err);
      }

      logger.info("Conexão com PostgreSQL estabelecida");
      syncSequelize({ force: true }, (syncErr) => {
        if (syncErr) {
          logger.error("Erro ao sincronizar banco de dados", { error: syncErr });
          return shutdownWithError(syncErr);
        }

        logger.info("Banco de dados sincronizado");

        // Carregar configurações padrão
        const configPath = path.join(__dirname, "config/initial-config.json");
        const defaultConfigs = JSON.parse(fs.readFileSync(configPath, "utf8"));
        ConfigService.initializeDefaultConfigs(defaultConfigs, (configErr) => {
          if (configErr) {
            logger.error("Erro ao inicializar configurações padrão", { error: configErr });
            return shutdownWithError(configErr);
          }

          // Obter todas as configurações do banco de dados
          ConfigService.getAllConfigs((configsErr, configs) => {
            if (configsErr) {
              logger.error("Erro ao obter configurações", { error: configsErr });
              return shutdownWithError(configsErr);
            }

            const NEED_INVITE_CODE = configs!.needInviteCode === "true";
            const MAX_CLIENTS = configs!.maxClients
              ? parseInt(configs!.maxClients)
              : DEFAULT_MAX_CLIENTS;

            logger.info("Seeding test data");
            seedTestData((seedErr) => {
              if (seedErr) {
                return shutdownWithError(seedErr);
              }

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

              // Criar servidor HTTP para WebSocket
              const httpServer = http.createServer((req, res) => {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("WebSocket server for admin panel");
              });

              // Iniciar WebSocketManager
              const webSocketManager = new WebSocketManager(httpServer, server, configs!);

              // Iniciar servidores
              logger.info("Starting ProTanki, Resource, and WebSocket servers");
              server.start();
              resourceServer.start();
              webSocketManager.start();

              // Graceful shutdown
              process.on("SIGTERM", () => {
                logger.info("Received SIGTERM. Initiating graceful shutdown...");
                server.stop((serverErr) => {
                  if (serverErr) {
                    logger.error("Error stopping ProTanki server", { error: serverErr });
                  } else {
                    logger.info("ProTanki server stopped");
                  }

                  resourceServer.stop((resourceErr) => {
                    if (resourceErr) {
                      logger.error("Error stopping Resource server", { error: resourceErr });
                    } else {
                      logger.info("Resource server stopped");
                    }

                    webSocketManager.stop((wsErr) => {
                      if (wsErr) {
                        logger.error("Error stopping WebSocket server", { error: wsErr });
                      } else {
                        logger.info("WebSocket server stopped");
                      }

                      closeSequelize((dbErr) => {
                        if (dbErr) {
                          logger.error("Error closing database connection", { error: dbErr });
                        } else {
                          logger.info("Database connection closed");
                        }

                        logger.info("Flushing logs before shutdown");
                        logger.on("finish", () => {
                          logger.info("Logger flushed and closed");
                          process.exit(serverErr || resourceErr || wsErr || dbErr ? 1 : 0);
                        });
                        logger.end();
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  } catch (error: unknown) {
    shutdownWithError(error);
  }
}

function shutdownWithError(error: unknown) {
  const errorDetails = error instanceof Error
    ? { message: error.message, stack: error.stack }
    : { message: String(error), stack: undefined };
  logger.error("Erro ao iniciar o servidor", errorDetails);
  logger.info("Flushing logs due to startup error");
  logger.on("finish", () => {
    logger.info("Logger flushed and closed due to startup error");
    setTimeout(() => process.exit(1), 1000);
  });
  logger.end();
}

bootstrap();