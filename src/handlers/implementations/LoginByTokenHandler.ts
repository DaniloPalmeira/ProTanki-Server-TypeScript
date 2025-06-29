import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import Punishment from "../../packets/implementations/Punishment";
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

      if (user.isPunished && user.punishmentExpiresAt && user.punishmentExpiresAt > new Date()) {
        const now = new Date();
        const timeLeftMs = user.punishmentExpiresAt.getTime() - now.getTime();
        const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

        client.sendPacket(new Punishment(user.punishmentReason, days, hours, minutes));
        logger.info(`Punished user ${user.username} attempted to login via token`, { client: client.getRemoteAddress() });
        return;
      }

      logger.info(`Successful login via token for user ${user.username}`, { client: client.getRemoteAddress() });

      client.sendPacket(new HideLoginForm());
      await LobbyWorkflow.enterLobby(client, server);
      server.notifySubscribersOfStatusChange(user.username, true);
    } catch (error: any) {
      logger.warn(`Failed login attempt via token`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new SystemMessage(error.message));
    }
  }
}
