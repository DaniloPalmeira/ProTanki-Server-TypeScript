import { battleDataObject } from "@/config/BattleData";
import { AddUserToBattleDmPacket, NotifyFriendOfBattlePacket, ReservePlayerSlotDmPacket, UnloadBattleListPacket } from "@/features/lobby/lobby.packets";
import SystemMessage from "@/features/system/system.packets";
import { UserDocument } from "@/models/User";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import { ItemUtils } from "@/utils/ItemUtils";
import logger from "@/utils/Logger";
import { GarageWorkflow } from "../garage/garage.workflow";
import { LobbyWorkflow } from "../lobby/lobby.workflow";
import { BattleMode } from "./battle.model";
import * as BattlePackets from "./battle.packets";
import { BattleWorkflow } from "./battle.workflow";

export class EnterBattleAsSpectatorHandler implements IPacketHandler<BattlePackets.EnterBattleAsSpectatorPacket> {
    public readonly packetId = BattlePackets.EnterBattleAsSpectatorPacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.EnterBattleAsSpectatorPacket): Promise<void> {
        if (!client.user || !client.lastViewedBattleId) {
            client.sendPacket(new SystemMessage("Nenhuma batalha selecionada."));
            return;
        }

        try {
            const battle = server.battleService.addSpectatorToBattle(client.user, client.lastViewedBattleId);
            client.currentBattle = battle;
            client.isSpectator = true;

            server.battleService.broadcastSpectatorListUpdate(battle, client);

            await BattleWorkflow.enterBattle(client, server, battle);
        } catch (error: any) {
            logger.warn(`User ${client.user.username} failed to enter battle ${client.lastViewedBattleId} as spectator`, {
                error: error.message,
                client: client.getRemoteAddress(),
            });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class EnterBattleHandler implements IPacketHandler<BattlePackets.EnterBattlePacket> {
    public readonly packetId = BattlePackets.EnterBattlePacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.EnterBattlePacket): Promise<void> {
        if (!client.user || !client.lastViewedBattleId) {
            client.sendPacket(new SystemMessage("Nenhuma batalha selecionada."));
            return;
        }

        try {
            const battle = server.battleService.addUserToBattle(client.user, client.lastViewedBattleId, packet.battleTeam);
            client.currentBattle = battle;

            await BattleWorkflow.enterBattle(client, server, battle);

            if (battle.settings.battleMode === BattleMode.DM) {
                const reserveSlotPacket = new ReservePlayerSlotDmPacket(battle.battleId, client.user.username);
                server.broadcastToBattleList(reserveSlotPacket);

                const addUserPacket = new AddUserToBattleDmPacket({
                    battleId: battle.battleId,
                    nickname: client.user.username,
                    kills: 0,
                    score: 0,
                    suspicious: false,
                });

                const battleDetailWatchers = server.getClients().filter((c) => (c.getState() === "chat_lobby" || c.getState() === "battle_lobby") && c.lastViewedBattleId === battle.battleId);

                for (const watcher of battleDetailWatchers) {
                    watcher.sendPacket(addUserPacket);
                }
            }

            const joiningUser = client.user;
            if (client.friendsCache.length > 0) {
                const mapInfo = battleDataObject.maps.find((m) => m.mapId === battle.settings.mapId);
                const mapName = mapInfo ? mapInfo.mapName : battle.settings.mapId;

                const notifyFriendsPacket = new NotifyFriendOfBattlePacket({
                    battleId: battle.battleId,
                    mapName: mapName,
                    mode: battle.settings.battleMode,
                    privateBattle: battle.settings.privateBattle,
                    probattle: battle.settings.proBattle,
                    maxRank: battle.settings.maxRank,
                    minRank: battle.settings.minRank,
                    serverNumber: 1,
                    nickname: joiningUser.username,
                });

                for (const friendUsername of client.friendsCache) {
                    const friendClient = server.findClientByUsername(friendUsername);
                    if (friendClient) {
                        friendClient.sendPacket(notifyFriendsPacket);
                    }
                }
            }
        } catch (error: any) {
            logger.warn(`User ${client.user.username} failed to enter battle ${client.lastViewedBattleId}`, {
                error: error.message,
                client: client.getRemoteAddress(),
            });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class ExitFromBattleHandler implements IPacketHandler<BattlePackets.ExitFromBattlePacket> {
    public readonly packetId = BattlePackets.ExitFromBattlePacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.ExitFromBattlePacket): Promise<void> {
        const user = client.user;
        const battle = client.currentBattle;
        const isSpectator = client.isSpectator;

        if (!user || !battle) {
            return;
        }

        if (!isSpectator) {
            server.battleService.announceTankRemoval(user, battle);
        }
        await server.battleService.finalizeBattleExit(user, battle, client.friendsCache, isSpectator);

        client.sendPacket(new BattlePackets.UnloadSpaceBattlePacket());

        client.currentBattle = null;
        client.isSpectator = false;
        client.battleState = "suicide";
        client.stopTimeChecker();

        if (packet.layout === 0) {
            if (client.getState() === "battle_lobby") {
                client.sendPacket(new UnloadBattleListPacket());
            }
            LobbyWorkflow.returnToLobby(client, server, false);
        } else if (packet.layout === 1) {
            GarageWorkflow.enterGarage(client, server);
        }
    }
}

export class FullMoveCommandHandler implements IPacketHandler<BattlePackets.FullMoveCommandPacket> {
    public readonly packetId = BattlePackets.FullMoveCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.FullMoveCommandPacket): void {
        if (!client.user || !client.currentBattle) {
            return;
        }

        client.battlePosition = packet.position;
        client.battleOrientation = packet.orientation;
        client.turretControl = packet.control;

        const battle = client.currentBattle;

        const fullMovePacket = new BattlePackets.FullMovePacket({
            nickname: client.user.username,
            angularVelocity: packet.angularVelocity,
            control: packet.control,
            linearVelocity: packet.linearVelocity,
            orientation: packet.orientation,
            position: packet.position,
            direction: packet.direction,
        });

        const allParticipants = battle.getAllParticipants();

        for (const participant of allParticipants) {
            if (participant.id === client.user.id) {
                continue;
            }

            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
                otherClient.sendPacket(fullMovePacket);
            }
        }

        server.battleService.checkPlayerPosition(client);
    }
}

export class MoveCommandHandler implements IPacketHandler<BattlePackets.MoveCommandPacket> {
    public readonly packetId = BattlePackets.MoveCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.MoveCommandPacket): void {
        if (!client.user || !client.currentBattle) {
            return;
        }

        client.battlePosition = packet.position;
        client.battleOrientation = packet.orientation;
        client.turretControl = packet.control;

        const battle = client.currentBattle;

        const movePacket = new BattlePackets.MovePacket({
            nickname: client.user.username,
            angularVelocity: packet.angularVelocity,
            control: packet.control,
            linearVelocity: packet.linearVelocity,
            orientation: packet.orientation,
            position: packet.position,
        });

        const allParticipants = battle.getAllParticipants();

        for (const participant of allParticipants) {
            if (participant.id === client.user.id) {
                continue;
            }

            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
                otherClient.sendPacket(movePacket);
            }
        }

        server.battleService.checkPlayerPosition(client);
    }
}

export class ReadyToActivateHandler implements IPacketHandler<BattlePackets.ReadyToActivatePacket> {
    public readonly packetId = BattlePackets.ReadyToActivatePacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.ReadyToActivatePacket): void {
        if (!client.user || !client.currentBattle) {
            return;
        }

        logger.info(`Activating tank for user ${client.user.username} in battle ${client.currentBattle.battleId}.`);

        client.battleState = "active";

        const battle = client.currentBattle;
        const activationPacket = new BattlePackets.ActivateTankPacket(client.user.username);

        const allPlayers = battle.getAllParticipants();
        for (const player of allPlayers) {
            const playerClient = server.findClientByUsername(player.username);
            if (playerClient && playerClient.currentBattle?.battleId === battle.battleId) {
                playerClient.sendPacket(activationPacket);
            }
        }
    }
}

export class ReadyToPlaceHandler implements IPacketHandler<BattlePackets.ReadyToPlacePacket> {
    public readonly packetId = BattlePackets.ReadyToPlacePacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.ReadyToPlacePacket): void {
        if (!client.user || !client.currentBattle || client.isSpectator) {
            return;
        }

        logger.info(`Placing user ${client.user.username} on the battlefield ${client.currentBattle.battleId}.`);

        try {
            const battle = client.currentBattle;
            const user = client.user;

            const broadcastToBattle = (packetToBroadcast: any) => {
                const allParticipants = battle.getAllParticipants();
                allParticipants.forEach((participant: UserDocument) => {
                    const participantClient = server.findClientByUsername(participant.username);
                    if (participantClient && participantClient.currentBattle?.battleId === battle.battleId) {
                        participantClient.sendPacket(packetToBroadcast);
                    }
                });
            };

            if (client.pendingEquipmentRespawn) {
                client.pendingEquipmentRespawn = false;

                broadcastToBattle(new BattlePackets.RemoveTankPacket(user.username));

                const tankModelJson = BattleWorkflow.getTankModelDataJson(client, battle);
                broadcastToBattle(new BattlePackets.TankModelDataPacket(tankModelJson));

                broadcastToBattle(new BattlePackets.EquipmentChangedPacket(user.username));
            }

            client.battleState = "newcome";
            client.currentHealth = ItemUtils.getHullArmor(user);

            const clientHealth = 10000;

            client.sendPacket(new BattlePackets.SetHealthPacket({ nickname: user.username, health: clientHealth }));

            const spawnPoint = client.pendingSpawnPoint;
            if (!spawnPoint) {
                logger.error(`No pending spawn point for ${client.user.username}. This should not happen.`);
                client.closeConnection();
                return;
            }
            client.pendingSpawnPoint = null;

            const spawnPosition = spawnPoint.position;
            const spawnRotation = spawnPoint.rotation;

            client.battlePosition = spawnPosition;
            client.battleOrientation = spawnRotation;

            let teamId = 2;
            if (battle.isTeamMode()) {
                if (battle.usersBlue.some((u: UserDocument) => u.id === user.id)) teamId = 1;
                if (battle.usersRed.some((u: UserDocument) => u.id === user.id)) teamId = 0;
            }

            const spawnPacket = new BattlePackets.SpawnPacket({
                nickname: user.username,
                team: teamId,
                position: spawnPosition,
                orientation: spawnRotation,
                health: clientHealth,
                incarnation: client.battleIncarnation,
            });

            broadcastToBattle(spawnPacket);
        } catch (error: any) {
            logger.error(`Failed to execute spawn logic for user ${client.user.username}`, { error });
        }
    }
}

export class ReadyToSpawnHandler implements IPacketHandler<BattlePackets.ReadyToSpawnPacket> {
    public readonly packetId = BattlePackets.ReadyToSpawnPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.ReadyToSpawnPacket): void {
        if (!client.user || !client.currentBattle) {
            return;
        }

        logger.info(`Client ${client.user.username} is ready to spawn in battle ${client.currentBattle.battleId}.`);

        const specs = ItemUtils.getTankSpecifications(client.user);
        client.sendPacket(new BattlePackets.TankSpecificationPacket({ ...specs, nickname: client.user.username, isPro: false }));

        const battle = client.currentBattle;
        let teamType: "DM" | "BLUE" | "RED" = "DM";
        if (battle.isTeamMode()) {
            if (battle.usersBlue.some((u: UserDocument) => u.id === client.user!.id)) teamType = "BLUE";
            if (battle.usersRed.some((u: UserDocument) => u.id === client.user!.id)) teamType = "RED";
        }

        const spawnPoint = server.battleService.getSpawnPoint(battle, teamType);

        const finalSpawnPosition = {
            x: spawnPoint.position.x,
            y: spawnPoint.position.y,
            z: spawnPoint.position.z + 200,
        };

        client.pendingSpawnPoint = {
            position: finalSpawnPosition,
            rotation: spawnPoint.rotation,
        };

        client.sendPacket(new BattlePackets.PrepareToSpawnPacket(finalSpawnPosition, spawnPoint.rotation));
    }
}

export class RotateTurretCommandHandler implements IPacketHandler<BattlePackets.RotateTurretCommandPacket> {
    public readonly packetId = BattlePackets.RotateTurretCommandPacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.RotateTurretCommandPacket): void {
        if (!client.user || !client.currentBattle) {
            return;
        }

        client.turretAngle = packet.angle;
        client.turretControl = packet.control;

        const battle = client.currentBattle;

        const turretRotationPacket = new BattlePackets.TurretRotationPacket({
            nickname: client.user.username,
            angle: packet.angle,
            control: packet.control,
        });

        const allParticipants = battle.getAllParticipants();

        for (const participant of allParticipants) {
            if (participant.id === client.user.id) {
                continue;
            }

            const otherClient = server.findClientByUsername(participant.username);
            if (otherClient && otherClient.currentBattle?.battleId === battle.battleId) {
                otherClient.sendPacket(turretRotationPacket);
            }
        }
    }
}

export class SendBattleChatMessageHandler implements IPacketHandler<BattlePackets.SendBattleChatMessagePacket> {
    public readonly packetId = BattlePackets.SendBattleChatMessagePacket.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.SendBattleChatMessagePacket): Promise<void> {
        const user = client.user;
        const battle = client.currentBattle;

        if (!user || !battle || !packet.message) {
            return;
        }

        let senderTeamId = 2; // NONE
        let senderTeam: UserDocument[] = [];

        if (battle.isTeamMode()) {
            if (battle.usersBlue.some((p: UserDocument) => p.id === user.id)) {
                senderTeamId = 1; // BLUE
                senderTeam = battle.usersBlue;
            } else if (battle.usersRed.some((p: UserDocument) => p.id === user.id)) {
                senderTeamId = 0; // RED
                senderTeam = battle.usersRed;
            }
        }

        const messageData = {
            nickname: user.username,
            message: packet.message,
            team: senderTeamId,
        };

        let messagePacket: BattlePackets.BattleChatMessagePacket | BattlePackets.BattleChatTeamMessagePacket;
        let recipients: UserDocument[];

        if (packet.team && battle.isTeamMode()) {
            messagePacket = new BattlePackets.BattleChatTeamMessagePacket(messageData);
            recipients = [...senderTeam, ...battle.spectators];
        } else {
            messagePacket = new BattlePackets.BattleChatMessagePacket(messageData);
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

export class SuicidePacketHandler implements IPacketHandler<BattlePackets.SuicidePacket> {
    public readonly packetId = BattlePackets.SuicidePacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.SuicidePacket): void {
        const { user, currentBattle } = client;

        if (!user || !currentBattle) {
            logger.warn(`SuicidePacket received from client without user or battle.`, {
                client: client.getRemoteAddress(),
            });
            return;
        }

        if (client.battleState === "suicide") {
            logger.warn(`User ${user.username} is already in the process of self-destructing.`);
            return;
        }

        logger.info(`User ${user.username} initiated self-destruct sequence in battle ${currentBattle.battleId}.`);

        const currentIncarnation = client.battleIncarnation;
        client.battleState = "suicide";

        setTimeout(() => {
            if (client.battleIncarnation !== currentIncarnation) {
                logger.info(`Self-destruct for ${user.username} aborted, tank was already destroyed.`);
                return;
            }

            if (!client.currentBattle) {
                logger.info(`Self-destruct for ${user.username} aborted, user left the battle.`);
                return;
            }

            logger.info(`Tank for ${user.username} was destroyed by self-destruct.`);

            const destroyPacket = new BattlePackets.DestroyTankPacket(user.username, 3000);

            const allParticipants = currentBattle.getAllParticipants();
            allParticipants.forEach((participant: UserDocument) => {
                const participantClient = server.findClientByUsername(participant.username);
                if (participantClient && participantClient.currentBattle?.battleId === currentBattle.battleId) {
                    participantClient.sendPacket(destroyPacket);
                }
            });

            client.battleIncarnation++;
            client.battleState = "suicide";
        }, 10000);
    }
}

export class TimeCheckerResponseHandler implements IPacketHandler<BattlePackets.TimeCheckerResponsePacket> {
    public readonly packetId = BattlePackets.TimeCheckerResponsePacket.getId();

    public execute(client: ProTankiClient, server: ProTankiServer, packet: BattlePackets.TimeCheckerResponsePacket): void {
        client.handleTimeCheckerResponse(packet.clientTime, packet.serverTime);
    }
}