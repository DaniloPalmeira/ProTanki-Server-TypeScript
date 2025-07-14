import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import SendBattleChatMessagePacket from "../../packets/implementations/SendBattleChatMessagePacket";
import BattleChatMessagePacket from "../../packets/implementations/BattleChatMessagePacket";
import { UserDocument } from "../../models/User";
import { IPacket } from "../../packets/interfaces/IPacket";
import BattleChatTeamMessagePacket from "../../packets/implementations/BattleChatTeamMessagePacket";

export default class SendBattleChatMessageHandler implements IPacketHandler<SendBattleChatMessagePacket> {
  public readonly packetId = SendBattleChatMessagePacket.getId();

  public async execute(client: ProTankiClient, server: ProTankiServer, packet: SendBattleChatMessagePacket): Promise<void> {
    const user = client.user;
    const battle = client.currentBattle;

    if (!user || !battle || !packet.message) {
      return;
    }

    let senderTeamId = 2; // NONE
    let senderTeam: UserDocument[] = [];

    if (battle.isTeamMode()) {
      if (battle.usersBlue.some((p) => p.id === user.id)) {
        senderTeamId = 1; // BLUE
        senderTeam = battle.usersBlue;
      } else if (battle.usersRed.some((p) => p.id === user.id)) {
        senderTeamId = 0; // RED
        senderTeam = battle.usersRed;
      }
    }

    const messageData = {
      nickname: user.username,
      message: packet.message,
      team: senderTeamId,
    };

    let messagePacket: IPacket;
    let recipients: UserDocument[];

    if (packet.team && battle.isTeamMode()) {
      messagePacket = new BattleChatTeamMessagePacket(messageData);
      recipients = [...senderTeam, ...battle.spectators];
    } else {
      messagePacket = new BattleChatMessagePacket(messageData);
      recipients = battle.getAllParticipants();
    }

    for (const recipient of recipients) {
      const recipientClient = server.findClientByUsername(recipient.username);
      if (recipientClient && recipientClient.currentBattle?.battleId === battle.battleId) {
        recipientClient.sendPacket(messagePacket);
      }
    }
  }
}
