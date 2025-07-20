import RequestBattleByLinkPacket from "../../packets/implementations/RequestBattleByLinkPacket";
import { LobbyWorkflow } from "../../workflows/LobbyWorkflow";
import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import logger from "../../utils/Logger";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";

export default class RequestBattleByLinkHandler implements IPacketHandler<RequestBattleByLinkPacket> {
    public readonly packetId = RequestBattleByLinkPacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: RequestBattleByLinkPacket): Promise<void> {
        if (!packet.battleId) {
            return;
        }

        const battle = server.battleService.getBattleById(packet.battleId);

        if (!battle) {
            logger.warn(`Client ${client.user?.username} requested details for non-existent battle ${packet.battleId}`);
            return;
        }

        client.lastViewedBattleId = battle.battleId;

        if (client.getState() === "chat_garage") {
            await LobbyWorkflow.returnToLobby(client, server, true);
        } else {
            await LobbyWorkflow.sendBattleDetails(client, server, battle);
        }
    }
}