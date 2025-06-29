import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import Login from "../../packets/implementations/Login";
import IncorrectPassword from "../../packets/implementations/IncorrectPassword";
import logger from "../../utils/Logger";
import Punishment from "../../packets/implementations/Punishment";
import HideLoginForm from "../../packets/implementations/HideLoginForm";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";

export default class LoginHandler implements IPacketHandler<Login> {
  public readonly packetId = Login.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: Login): Promise<void> {
    if (!packet.username || !packet.password) {
      client.sendPacket(new IncorrectPassword());
      return;
    }

    try {
      const user = await server.userService.login(packet.username, packet.password, null);
      client.user = user;

      if (user.isPunished && user.punishmentExpiresAt && user.punishmentExpiresAt > new Date()) {
        const now = new Date();
        const timeLeftMs = user.punishmentExpiresAt.getTime() - now.getTime();

        const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

        client.sendPacket(new Punishment(user.punishmentReason, days, hours, minutes));
        logger.info(`Punished user ${user.username} attempted to login`, { client: client.getRemoteAddress() });
        return;
      }

      logger.info(`Successful login for user ${user.username}`, {
        client: client.getRemoteAddress(),
      });

      client.sendPacket(new HideLoginForm());
      await LobbyWorkflow.enterLobby(client, server);

      server.notifySubscribersOfStatusChange(user.username, true);
    } catch (error: any) {
      logger.warn(`Failed login attempt for username ${packet.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new IncorrectPassword());
    }
  }
}
