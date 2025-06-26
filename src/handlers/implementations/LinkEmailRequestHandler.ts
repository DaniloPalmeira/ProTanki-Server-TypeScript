import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import logger from "../../utils/Logger";
import LinkEmailRequest from "../../packets/implementations/LinkEmailRequest";
import LinkAccountResultSuccess from "../../packets/implementations/LinkAccountResultSuccess";
import LinkAccountResultError from "../../packets/implementations/LinkAccountResultError";
import LinkAccountFailedAccountInUse from "../../packets/implementations/LinkAccountFailedAccountInUse";

export default class LinkEmailRequestHandler implements IPacketHandler<LinkEmailRequest> {
  public readonly packetId = LinkEmailRequest.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: LinkEmailRequest): Promise<void> {
    const currentUser = client.user;
    if (!currentUser || !packet.email) {
      return;
    }

    try {
      const updatedUser = await server.userService.linkEmailToAccount(currentUser, packet.email);
      client.user = updatedUser;
      client.sendPacket(new LinkAccountResultSuccess(updatedUser.email ?? null));
    } catch (error: any) {
      if (error.message === "EMAIL_IN_USE") {
        client.sendPacket(new LinkAccountFailedAccountInUse("email"));
      } else {
        logger.error(`Failed to link email for user ${currentUser.username}`, {
          error: error.message,
          client: client.getRemoteAddress(),
        });
        client.sendPacket(new LinkAccountResultError());
      }
    }
  }
}
