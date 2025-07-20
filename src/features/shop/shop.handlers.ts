import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "@/utils/Logger";
import * as ShopPackets from "./shop.packets";

export class RequestShopDataHandler implements IPacketHandler<ShopPackets.RequestShopData> {
    public readonly packetId = ShopPackets.RequestShopData.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: ShopPackets.RequestShopData): void {
        if (!client.user) {
            logger.warn("RequestShopData received from unauthenticated client.", { client: client.getRemoteAddress() });
            return;
        }
        const shopDataPayload = server.shopService.getShopData(client.user, client.shopCountryCode);
        client.sendPacket(new ShopPackets.ShopData(shopDataPayload));
    }
}

export class SetShopCountryHandler implements IPacketHandler<ShopPackets.SetShopCountry> {
    public readonly packetId = ShopPackets.SetShopCountry.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: ShopPackets.SetShopCountry): void {
        if (packet.countryCode) {
            client.shopCountryCode = packet.countryCode.toUpperCase();
            logger.info(`Client ${client.getRemoteAddress()} set shop country to ${client.shopCountryCode}`);
        }
    }
}

export class RequestPaymentWindowHandler implements IPacketHandler<ShopPackets.RequestPaymentWindow> {
    public readonly packetId = ShopPackets.RequestPaymentWindow.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: ShopPackets.RequestPaymentWindow): void {
        client.sendPacket(new ShopPackets.ShowPaymentWindow());
    }
}