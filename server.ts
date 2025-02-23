import { ProTankiServer } from "./src/server/ProTankiServer";

const PORT = 1337;
const MAX_CLIENTS = 100;

const server = new ProTankiServer({
  port: PORT,
  maxClients: MAX_CLIENTS,
  needInviteCode: false,
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
