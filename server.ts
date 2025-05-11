import { ProTankiServer } from "./src/server/ProTankiServer";
import dotenv from "dotenv";
import sequelize from "./src/database";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 1337;
const MAX_CLIENTS = process.env.MAX_CLIENTS
  ? parseInt(process.env.MAX_CLIENTS)
  : 10;
const NEED_INVITE_CODE = process.env.NEED_INVITE_CODE === "true";

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão com PostgreSQL estabelecida");
    await sequelize.sync({ force: true }); // force: false preserva dados
    console.log("Banco de dados sincronizado");
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
    process.exit(1);
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

  server.start();
})();
