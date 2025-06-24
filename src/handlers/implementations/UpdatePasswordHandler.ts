import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import UpdatePassword from "../../packets/implementations/UpdatePassword";
import UpdatePasswordResult from "../../packets/implementations/UpdatePasswordResult";
import logger from "../../utils/Logger";

export default class UpdatePasswordHandler implements IPacketHandler<UpdatePassword> {
  public readonly packetId = UpdatePassword.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: UpdatePassword): Promise<void> {
    const originalEmail = client.recoveryEmail;

    if (!originalEmail || !packet.password || !packet.email) {
      client.sendPacket(new UpdatePasswordResult(true, "Dados inválidos."));
      return;
    }

    try {
      await server.userService.updatePasswordByEmail(originalEmail, packet.password, packet.email);

      logger.info(`Password updated for user with original email ${originalEmail}`, {
        client: client.getRemoteAddress(),
        newEmail: packet.email,
      });

      client.sendPacket(new UpdatePasswordResult(false, "Sua senha foi alterada com sucesso."));
    } catch (error: any) {
      logger.error(`Failed to update password for ${originalEmail}`, { error: error.message });

      if (error.message.includes("is already in use")) {
        client.sendPacket(new UpdatePasswordResult(true, "O e-mail fornecido já está em uso por outra conta."));
      } else {
        client.sendPacket(new UpdatePasswordResult(true, "Ocorreu um erro ao atualizar sua senha."));
      }
    }
  }
}
