import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import SetNotifications from "../../packets/implementations/SetNotifications";

export default class SetNotificationsHandler implements IPacketHandler<SetNotifications> {
  public readonly packetId = SetNotifications.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SetNotifications): Promise<void> {
    if (!client.user) {
      logger.warn("SetNotifications received from unauthenticated client.", { client: client.getRemoteAddress() });
      return;
    }

    try {
      client.user.notificationsEnabled = packet.enabled;
      await client.user.save();

      logger.info(`User ${client.user.username} updated notifications to: ${packet.enabled}.`);
    } catch (error) {
      logger.error(`Failed to save notification settings for user ${client.user.username}`, { error });
    }
  }
}
