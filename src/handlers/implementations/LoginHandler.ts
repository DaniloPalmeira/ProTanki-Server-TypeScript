import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import Login from "../../packets/implementations/Login";
import IncorrectPassword from "../../packets/implementations/IncorrectPassword";
import logger from "../../utils/Logger";
import HideLoginForm from "../../packets/implementations/HideLoginForm";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import LoginTokenPacket from "../../packets/implementations/LoginTokenPacket";

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

      logger.info(`Successful login for user ${user.username}`, {
        client: client.getRemoteAddress(),
      });

      
      const flowHandled = await LobbyWorkflow.postAuthenticationFlow(client, server);
      
      if (flowHandled && packet.rememberMe) {
        const token = await server.userService.generateAndSetLoginToken(user);
        client.sendPacket(new LoginTokenPacket(token));
      }
    } catch (error: any) {
      logger.warn(`Failed login attempt for username ${packet.username}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });
      client.sendPacket(new IncorrectPassword());
    }
  }
}
