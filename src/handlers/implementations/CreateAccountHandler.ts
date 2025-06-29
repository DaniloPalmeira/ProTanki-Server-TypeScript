import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import CreateAccount from "../../packets/implementations/CreateAccount";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { ValidationUtils } from "../../utils/ValidationUtils";
import InvalidNickname from "../../packets/implementations/InvalidNickname";
import logger from "../../utils/Logger";
import NicknameUnavailable from "../../packets/implementations/NicknameUnavailable";
import LoginTokenPacket from "../../packets/implementations/LoginTokenPacket";

export default class CreateAccountHandler implements IPacketHandler<CreateAccount> {
  public readonly packetId = CreateAccount.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: CreateAccount): Promise<void> {
    if (!packet.nickname || !packet.password || packet.nickname.length < 3 || packet.password.length < 3) {
      client.sendPacket(new SystemMessage("Apelido ou senha inválidos."));
      return;
    }

    if (ValidationUtils.isNicknameInappropriate(packet.nickname)) {
      client.sendPacket(new InvalidNickname());
      return;
    }

    try {
      const user = await server.userService.createUser({
        username: packet.nickname,
        password: packet.password,
      });

      if (packet.rememberMe) {
        const token = await server.userService.generateAndSetLoginToken(user);
        client.sendPacket(new LoginTokenPacket(token));
      }

      logger.info(`Account created successfully for ${packet.nickname}`, {
        client: client.getRemoteAddress(),
      });

      client.sendPacket(new SystemMessage("Conta criada com sucesso!\nVocê já pode fazer o login."));
    } catch (error: any) {
      logger.warn(`Failed to create account for ${packet.nickname}`, {
        error: error.message,
        client: client.getRemoteAddress(),
      });

      if (error.message.includes("already exists")) {
        const suggestions = await server.userService.generateUsernameSuggestions(packet.nickname);
        client.sendPacket(new NicknameUnavailable(suggestions));
      } else {
        client.sendPacket(new SystemMessage("Ocorreu um erro ao criar a conta.\nTente novamente."));
      }
    }
  }
}
