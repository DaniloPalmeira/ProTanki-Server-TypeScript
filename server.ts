import { ProTankiServer } from "./src/server/ProTankiServer";
import dotenv from "dotenv";
import sequelize from "./src/database";
import { DEFAULT_MAX_CLIENTS, DEFAULT_PORT } from "./src/config/constants";
import { InviteService } from "./src/services/InviteService";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_PORT;
const MAX_CLIENTS = process.env.MAX_CLIENTS ? parseInt(process.env.MAX_CLIENTS) : DEFAULT_MAX_CLIENTS;
const NEED_INVITE_CODE = process.env.NEED_INVITE_CODE === "true";

async function seedTestData() {
  try {
    // Gerar 5 códigos de convite de teste
    const testInviteCodes = [];
    for (let i = 0; i < 5; i++) {
      const code = await InviteService.createInviteCode();
      testInviteCodes.push(code);
    }
    console.log("Códigos de convite de teste gerados:", testInviteCodes);
  } catch (error) {
    console.error("Erro ao gerar dados de teste:", error);
  }
}

async function bootstrap() {
  try {
    await sequelize.authenticate();
    console.log("Conexão com PostgreSQL estabelecida");
    await sequelize.sync({ force: true }); // force: true apenas para desenvolvimento
    console.log("Banco de dados sincronizado");

    // Inserir dados de teste
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

    server.start();

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("Received SIGTERM. Shutting down gracefully...");
      await server.stop();
      await sequelize.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

bootstrap();