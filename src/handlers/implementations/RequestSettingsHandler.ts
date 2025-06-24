import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestSettings from "../../packets/implementations/RequestSettings";
import logger from "../../utils/Logger";
import UserSettingsSocial from "../../packets/implementations/UserSettingsSocial";
import UserSettingsNotifications from "../../packets/implementations/UserSettingsNotifications";
import { ISocialLink } from "../../packets/interfaces/IUserSettingsSocial";

export default class RequestSettingsHandler implements IPacketHandler<RequestSettings> {
  public readonly packetId = RequestSettings.getId();

  public execute(client: ProTankiClient, server: ProTankiServer): void {
    if (!client.user) {
      logger.warn("RequestSettings received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    const socialAuthConfig = server.configService.getSocialAuthLinks();

    // TODO: A lógica de 'isLinked' deve ser implementada quando a vinculação de contas for adicionada.
    const socialLinks: ISocialLink[] = Object.entries(socialAuthConfig).map(([id, url]) => ({
      snId: id,
      authorizationUrl: url,
      isLinked: false,
    }));

    // TODO: A lógica de 'passwordCreated' deve ser revista se contas sem senha forem permitidas.
    const passwordCreated = !!client.user.password;

    client.sendPacket(new UserSettingsSocial(passwordCreated, socialLinks));
    client.sendPacket(new UserSettingsNotifications(client.user.notificationsEnabled));
  }
}
