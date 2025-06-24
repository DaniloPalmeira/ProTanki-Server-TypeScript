import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import RequestChangePasswordForm from "../../packets/implementations/RequestChangePasswordForm";
import ChangePasswordForm from "../../packets/implementations/ChangePasswordForm";
import CreatePasswordForm from "../../packets/implementations/CreatePasswordForm";

export default class RequestChangePasswordFormHandler implements IPacketHandler<RequestChangePasswordForm> {
  public readonly packetId = RequestChangePasswordForm.getId();

  public execute(client: ProTankiClient, server: ProTankiServer): void {
    if (!client.user) {
      logger.warn("RequestChangePasswordForm received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    // O schema atual exige uma senha, então `client.user.password` sempre existirá para um usuário logado.
    // A lógica é mantida para futura implementação de contas apenas com login social.
    const passwordCreated = !!client.user.password;

    if (passwordCreated) {
      client.sendPacket(new ChangePasswordForm());
    } else {
      client.sendPacket(new CreatePasswordForm());
    }
  }
}
