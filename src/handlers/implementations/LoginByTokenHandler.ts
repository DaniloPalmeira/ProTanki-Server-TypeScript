import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import HideLoginForm from "../../packets/implementations/HideLoginForm";
import LoginByTokenRequestPacket from "../../packets/implementations/LoginByTokenRequestPacket";
import SystemMessage from "../../packets/implementations/SystemMessage";

export default class LoginByTokenHandler implements IPacketHandler<LoginByTokenRequestPacket> {
  public readonly packetId = LoginByTokenRequestPacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: LoginByTokenRequestPacket): Promise<void> {
    if (!packet.hash) {
      client.sendPacket(new SystemMessage("Token de login inválido."));
      return;
    }

    try {
      const user = await server.userService.findUserByLoginToken(packet.hash);
      if (!user) {
        throw new Error("Token de login inválido ou expirado.");
      }

      client.user = user;

      logger.info(`Successful login via token for user ${user.username}`, { client: client.getRemoteAddress() });

      await LobbyWorkflow.postAuthenticationFlow(client, server);
    } catch (error: any) {
      logger.warn(`Failed login attempt via token`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
