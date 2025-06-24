import SetLayout from "../packets/implementations/SetLayout";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";

export class LobbyWorkflow {
  public static async enterLobby(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    // LayoutState = 0 = "BATTLE_SELECT"
    client.sendPacket(new SetLayout(0));

    // Próximos pacotes do lobby serão adicionados aqui...
  }
}
