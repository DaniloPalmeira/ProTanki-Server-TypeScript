import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RecoveryAccountSendCode from "../../packets/implementations/RecoveryAccountSendCode";
import logger from "../../utils/Logger";
import crypto from "crypto";
import RecoveryEmailSent from "../../packets/implementations/RecoveryEmailSent";
import RecoveryEmailNotExists from "../../packets/implementations/RecoveryEmailNotExists";

export default class RecoveryAccountSendCodeHandler implements IPacketHandler<RecoveryAccountSendCode> {
  public readonly packetId = RecoveryAccountSendCode.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: RecoveryAccountSendCode): Promise<void> {
    if (!packet.email) {
      client.sendPacket(new RecoveryEmailNotExists());
      return;
    }

    logger.info(`Recovery code requested for email: ${packet.email}`, {
      client: client.getRemoteAddress(),
    });

    try {
      const user = await server.userService.findUserByEmail(packet.email);
      if (user) {
        const recoveryCode = crypto.randomBytes(16).toString("hex");

        logger.info(`Recovery email sent to: ${packet.email}, code: ${recoveryCode}`);
        client.recoveryEmail = packet.email;
        client.recoveryCode = recoveryCode;
        client.sendPacket(new RecoveryEmailSent());
      } else {
        logger.info(`Email not found: ${packet.email}`);
        client.sendPacket(new RecoveryEmailNotExists());
      }
    } catch (error) {
      logger.error(`Error checking email ${packet.email}`, { error });
      client.sendPacket(new RecoveryEmailNotExists());
    }
  }
}
