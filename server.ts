import { ProTankiServer } from "./src/server/ProTankiServer";

const PORT = 1337;
const MAX_CLIENTS = 100;

const server = new ProTankiServer({
  port: PORT,
  maxClients: MAX_CLIENTS,
  needInviteCode: false,
});
server.start();
