import { weaponPhysicsData } from "@/config/PhysicsData";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { ItemUtils } from "@/utils/item.utils";
import logger from "@/utils/Logger";
import * as SmokyPackets from "./smoky.packets";

export class SmokyStaticShotCommandHandler implements IPacketHandler<SmokyPackets.SmokyStaticShotCommandPacket> {
    public readonly packetId = SmokyPackets.SmokyStaticShotCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: SmokyPackets.SmokyStaticShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) {
            logger.warn("SmokyStaticShotCommandHandler received packet from client not in battle.", { client: client.getRemoteAddress() });
            return;
        }
        const staticShotPacket = new SmokyPackets.SmokyStaticShotPacket(user.username, packet.hitPosition);
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(staticShotPacket);
            }
        }
    }
}

export class SmokyTargetShotCommandHandler implements IPacketHandler<SmokyPackets.SmokyTargetShotCommandPacket> {
    public readonly packetId = SmokyPackets.SmokyTargetShotCommandPacket.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: SmokyPackets.SmokyTargetShotCommandPacket): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle || !packet.targetUserId) {
            logger.warn("SmokyTargetShotCommandHandler received incomplete packet.", { client: client.getRemoteAddress() });
            return;
        }
        const turretMod = ItemUtils.getItemModification(user, "turret");
        const critChance = ItemUtils.getPropertyValue(turretMod, "CRITICAL_HIT_CHANCE") ?? 0;
        const isCritical = Math.random() * 100 < critChance;
        let impactForceRatio = 1.0;
        const shooterPosition = client.battlePosition;
        if (shooterPosition && packet.hitGlobalPosition) {
            const dx = shooterPosition.x - packet.hitGlobalPosition.x;
            const dy = shooterPosition.y - packet.hitGlobalPosition.y;
            const dz = shooterPosition.z - packet.hitGlobalPosition.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) / 100;
            const weaponId = `${user.equippedTurret}_m${user.turrets.get(user.equippedTurret) ?? 0}`;
            const physics = weaponPhysicsData.weapons.find((w) => w.id === weaponId);
            const maxRange = physics?.min_damage_radius ?? 100;
            if (distance > 0 && distance < maxRange) {
                impactForceRatio = 1.0 - distance / maxRange;
            } else if (distance >= maxRange) {
                impactForceRatio = 0;
            }
        }
        const finalImpactForce = Math.max(0.01, impactForceRatio);
        const targetShotPacket = new SmokyPackets.SmokyTargetShotPacket({
            nickname: user.username,
            targetNickname: packet.targetUserId,
            hitPosition: packet.hitLocalPosition,
            impactForce: finalImpactForce,
            critical: isCritical,
        });
        const allParticipants = currentBattle.getAllParticipants();
        for (const participant of allParticipants) {
            if (participant.id === user.id) continue;
            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === currentBattle.battleId) {
                otherClient.sendPacket(targetShotPacket);
            }
        }
        logger.info(`Smoky shot from ${user.username} to ${packet.targetUserId}. Critical: ${isCritical}, Impact: ${finalImpactForce.toFixed(2)}`);
    }
}