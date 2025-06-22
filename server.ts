import { ProTankiServer } from "./src/server/ProTankiServer";
import { ResourceServer } from "./src/server/ResourceServer";
import dotenv from "dotenv";
import { connectToDatabase, disconnectFromDatabase } from "./src/database";
import { DEFAULT_MAX_CLIENTS, DEFAULT_PORT } from "./src/config/constants";
import { InviteService } from "./src/services/InviteService";
import { UserService } from "./src/services/UserService";
import { ConfigService } from "./src/services/ConfigService";
import { ResourceManager } from "./src/utils/ResourceManager";
import logger from "./src/utils/Logger";
import fs from "fs";
import path from "path";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;

async function seedTestData(): Promise<void> {
    const testInviteCodes: string[] = [];
    for (let i = 0; i < 5; i++) {
        try {
            const code = await InviteService.createInviteCode();
            testInviteCodes.push(code);
        } catch (error) {
            logger.error("Erro ao gerar código de teste", { error });
            throw error;
        }
    }
    logger.info("Códigos de convite de teste gerados", { codes: testInviteCodes });

    const testUsers = [
        { username: "player1", password: "password123", email: "player1@example.com" },
        { username: "player2", password: "password123", email: "player2@example.com" },
    ];

    for (const userData of testUsers) {
        try {
            await UserService.createUser(userData);
        } catch (error: any) {
            if (error.message.includes("already exists")) {
                logger.warn(`Usuário de teste ${userData.username} já existe, pulando.`);
            } else {
                logger.error(`Erro ao criar usuário de teste ${userData.username}`, { error });
                throw error;
            }
        }
    }
    logger.info("Usuários de teste criados", { users: testUsers.map((u) => u.username) });
}

async function bootstrap() {
    logger.info("Starting server initialization");

    ResourceManager.loadResources();
    logger.info("Resource configurations loaded");

    await connectToDatabase();
    logger.info("Database connection established");

    const configPath = path.join(__dirname, "initial-config.json");
    const defaultConfigs = JSON.parse(fs.readFileSync(configPath, "utf8"));
    await ConfigService.initializeDefaultConfigs(defaultConfigs);

    const configs = await ConfigService.getAllConfigs();
    const NEED_INVITE_CODE = configs.needInviteCode === "true";
    const MAX_CLIENTS = configs.maxClients ? parseInt(configs.maxClients) : DEFAULT_MAX_CLIENTS;

    const socialLinksJson = configs.socialAuthLinks || "{}";
    let socialLinksObj: { [key: string]: string } = {};
    try {
        socialLinksObj = JSON.parse(socialLinksJson);
    } catch (error) {
        logger.error("Failed to parse socialAuthLinks from config", { error });
    }

    const socialNetworks = Object.entries(socialLinksObj)
        .map(([key, url]) => {
            if (typeof url === 'string' && url.trim() !== '') {
                return [url, key];
            }
            return null;
        })
        .filter((item): item is [string, string] => item !== null);


    logger.info("Seeding test data");
    await seedTestData();

    const server = new ProTankiServer({
        port: PORT,
        maxClients: MAX_CLIENTS,
        needInviteCode: NEED_INVITE_CODE,
        socialNetworks: socialNetworks,
        loginForm: {
            bgResource: 122842,
            enableRequiredEmail: false,
            maxPasswordLength: 64,
            minPasswordLength: 3,
        },
    });

    const resourceServer = new ResourceServer();

    logger.info("Starting ProTanki and Resource servers");
    server.start();
    resourceServer.start();

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
        const errorDetails = error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { message: String(error), stack: undefined };

        logger.error("Failed to bootstrap server", { error: errorDetails });

        logger.on("finish", () => {
            logger.info("Logger flushed and closed due to startup error");
            setTimeout(() => process.exit(1), 1000);
        });
        logger.end();
    }
})();