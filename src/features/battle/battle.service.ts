import * as LobbyPackets from "@/features/lobby/lobby.packets";
import { LobbyService } from "@/features/lobby/lobby.service";
import { IPacket } from "@/packets/packet.interfaces";
import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { UserDocument } from "@/shared/models/user.model";
import { IVector3 } from "@/shared/types/geom/ivector3";
import { mapGeometries } from "@/types/mapGeometries";
import { mapSpawns } from "@/types/mapSpawns";
import logger from "@/utils/logger";
import { Battle, BattleMode } from "./battle.model";
import { CaptureFlagPacket, DestroyTankPacket, DropFlagPacket, RemoveTankPacket, ReturnFlagPacket, TakeFlagPacket, UpdateSpectatorListPacket, UserDisconnectedDmPacket } from "./battle.packets";

interface IDisconnectedPlayerInfo {
    battleId: string;
    timeoutId: NodeJS.Timeout;
}

export class BattleService {
    private disconnectedPlayers = new Map<string, IDisconnectedPlayerInfo>();
    private server: GameServer;
    private lobbyService: LobbyService;

    constructor(server: GameServer, lobbyService: LobbyService) {
        this.server = server;
        this.lobbyService = lobbyService;
    }

    private broadcastToBattle(battle: Battle, packet: IPacket): void {
        const allParticipants = battle.getAllParticipants();
        allParticipants.forEach((participant) => {
            const pClient = this.server.findClientByUsername(participant.username);
            if (pClient && pClient.currentBattle?.battleId === battle.battleId) {
                pClient.sendPacket(packet);
            }
        });
    }

    private _clearFlagReturnTimer(battle: Battle, flagTeam: "RED" | "BLUE"): void {
        const timerProp = flagTeam === "RED" ? "flagReturnTimerRed" : "flagReturnTimerBlue";
        if (battle[timerProp]) {
            clearTimeout(battle[timerProp]!);
            battle[timerProp] = null;
            logger.info(`Cleared auto-return timer for ${flagTeam} flag in battle ${battle.battleId}`);
        }
    }

    public returnFlagToBase(battle: Battle, flagTeam: "RED" | "BLUE", returningUser: UserDocument | null = null): void {
        const teamId = flagTeam === "RED" ? 0 : 1;
        const flagPositionProp = flagTeam === "RED" ? "flagPositionRed" : "flagPositionBlue";
        const flagBasePositionProp = flagTeam === "RED" ? "flagBasePositionRed" : "flagBasePositionBlue";
        const carrierProp = flagTeam === "RED" ? "flagCarrierRed" : "flagCarrierBlue";

        if (battle[flagPositionProp] === battle[flagBasePositionProp] && !battle[carrierProp]) {
            return;
        }

        battle[flagPositionProp] = battle[flagBasePositionProp];
        battle[carrierProp] = null;
        this._clearFlagReturnTimer(battle, flagTeam);

        const nickname = returningUser ? returningUser.username : null;
        logger.info(`${flagTeam} flag returned to base in battle ${battle.battleId}. Triggered by: ${nickname ?? "auto-timer/event"}`);

        const returnPacket = new ReturnFlagPacket({ team: teamId, nickname });
        this.broadcastToBattle(battle, returnPacket);
    }

    public captureFlag(user: UserDocument, battle: Battle, capturedFlagTeam: "RED" | "BLUE"): void {
        const carrierProp = capturedFlagTeam === "RED" ? "flagCarrierRed" : "flagCarrierBlue";
        if (battle[carrierProp]?.id !== user.id) return;

        const teamId = capturedFlagTeam === "RED" ? 0 : 1;
        logger.info(`User ${user.username} captured the ${capturedFlagTeam} flag in battle ${battle.battleId}`);

        const capturePacket = new CaptureFlagPacket({ team: teamId, nickname: user.username });
        this.broadcastToBattle(battle, capturePacket);

        this.returnFlagToBase(battle, "RED");
        this.returnFlagToBase(battle, "BLUE");
    }

    public async checkPlayerPosition(client: GameClient): Promise<void> {
        const { user, currentBattle, battlePosition } = client;
        if (!user || !currentBattle || !battlePosition) return;

        if (currentBattle.settings.battleMode === BattleMode.CTF) {
            const PICKUP_RADIUS_SQ = 500 * 500;
            const isOnRedTeam = currentBattle.usersRed.some((u) => u.id === user.id);
            const isOnBlueTeam = currentBattle.usersBlue.some((u) => u.id === user.id);

            if (isOnRedTeam) {
                if (currentBattle.flagPositionRed && currentBattle.flagBasePositionRed && currentBattle.flagPositionRed.x !== currentBattle.flagBasePositionRed.x) {
                    const dx = battlePosition.x - currentBattle.flagPositionRed.x;
                    const dy = battlePosition.y - currentBattle.flagPositionRed.y;
                    const dz = battlePosition.z - currentBattle.flagPositionRed.z;
                    if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS_SQ) {
                        this.returnFlagToBase(currentBattle, "RED", user);
                    }
                }
                if (currentBattle.flagCarrierBlue?.id === user.id && currentBattle.flagBasePositionRed) {
                    const dx = battlePosition.x - currentBattle.flagBasePositionRed.x;
                    const dy = battlePosition.y - currentBattle.flagBasePositionRed.y;
                    const dz = battlePosition.z - currentBattle.flagBasePositionRed.z;
                    if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS_SQ) {
                        this.captureFlag(user, currentBattle, "BLUE");
                    }
                }
            } else if (isOnBlueTeam) {
                if (currentBattle.flagPositionBlue && currentBattle.flagBasePositionBlue && currentBattle.flagPositionBlue.x !== currentBattle.flagBasePositionBlue.x) {
                    const dx = battlePosition.x - currentBattle.flagPositionBlue.x;
                    const dy = battlePosition.y - currentBattle.flagPositionBlue.y;
                    const dz = battlePosition.z - currentBattle.flagPositionBlue.z;
                    if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS_SQ) {
                        this.returnFlagToBase(currentBattle, "BLUE", user);
                    }
                }
                if (currentBattle.flagCarrierRed?.id === user.id && currentBattle.flagBasePositionBlue) {
                    const dx = battlePosition.x - currentBattle.flagBasePositionBlue.x;
                    const dy = battlePosition.y - currentBattle.flagBasePositionBlue.y;
                    const dz = battlePosition.z - currentBattle.flagBasePositionBlue.z;
                    if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS_SQ) {
                        this.captureFlag(user, currentBattle, "RED");
                    }
                }
            }

            if (currentBattle.flagPositionRed) {
                const dx = battlePosition.x - currentBattle.flagPositionRed.x;
                const dy = battlePosition.y - currentBattle.flagPositionRed.y;
                const dz = battlePosition.z - currentBattle.flagPositionRed.z;
                if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS_SQ) {
                    try {
                        this.takeFlag(user, currentBattle, "RED");
                    } catch (e: any) { }
                }
            }

            if (currentBattle.flagPositionBlue) {
                const dx = battlePosition.x - currentBattle.flagPositionBlue.x;
                const dy = battlePosition.y - currentBattle.flagPositionBlue.y;
                const dz = battlePosition.z - currentBattle.flagPositionBlue.z;
                if (dx * dx + dy * dy + dz * dz < PICKUP_RADIUS_SQ) {
                    try {
                        this.takeFlag(user, currentBattle, "BLUE");
                    } catch (e: any) { }
                }
            }
        }

        const geometries = mapGeometries[currentBattle.mapResourceId];
        if (!geometries) return;

        for (const box of geometries) {
            const isInside =
                battlePosition.x >= box.minX &&
                battlePosition.x <= box.maxX &&
                battlePosition.y >= box.minY &&
                battlePosition.y <= box.maxY &&
                battlePosition.z >= box.minZ &&
                battlePosition.z <= box.maxZ;

            if (isInside) {
                await this.handleSpecialGeometryAction(client, box.action);
                break;
            }
        }
    }

    private async handleSpecialGeometryAction(client: GameClient, action: "kill" | "kick"): Promise<void> {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) return;

        logger.info(`User ${user.username} entered a special geometry zone with action: ${action}`);

        if (action === "kill") {
            if (currentBattle.flagCarrierRed?.id === user.id) {
                this.returnFlagToBase(currentBattle, "RED");
            }
            if (currentBattle.flagCarrierBlue?.id === user.id) {
                this.returnFlagToBase(currentBattle, "BLUE");
            }
            if (client.battleState === "suicide") return;

            client.battleState = "suicide";
            client.battleIncarnation++;

            const destroyPacket = new DestroyTankPacket(user.username, 3000);

            const allParticipants = currentBattle.getAllParticipants();
            allParticipants.forEach((p: UserDocument) => {
                const pClient = this.server.findClientByUsername(p.username);
                if (pClient && pClient.currentBattle?.battleId === currentBattle.battleId) {
                    pClient.sendPacket(destroyPacket);
                }
            });
        } else if (action === "kick") {
            logger.warn(`Usuário ${user.username} foi kickado por entrar em uma área proibida.`);
            setTimeout(() => client.closeConnection(), 100);
        }
    }

    public getSpawnPoint(battle: Battle, team: "DM" | "BLUE" | "RED"): { position: IVector3; rotation: IVector3 } {
        const allMapSpawns = mapSpawns[battle.mapResourceId];
        if (!allMapSpawns || allMapSpawns.length === 0) {
            logger.warn(`No spawn points found for map ${battle.mapResourceId}. Using fallback.`);
            return { position: { x: 0, y: 0, z: 200 }, rotation: { x: 0, y: 0, z: 0 } };
        }

        const teamType = team.toLowerCase();
        let candidateSpawns;

        if (battle.settings.battleMode === BattleMode.CP) {
            candidateSpawns = allMapSpawns.filter((sp) => sp.type.toLowerCase() === "dom");
        } else {
            candidateSpawns = allMapSpawns.filter((sp) => sp.type.toLowerCase() === teamType);
        }

        if (candidateSpawns.length === 0) {
            logger.warn(`No specific spawn points of type for this mode on map ${battle.mapResourceId}. Using all available as fallback.`);
            candidateSpawns = allMapSpawns;
        }

        const activePlayers = this.server.getClients().filter((c) => c.currentBattle?.battleId === battle.battleId && c.battleState === "active" && c.battlePosition);
        const occupiedPositions = activePlayers.map((p) => p.battlePosition!);

        const isOccupied = (spawnPos: IVector3) => {
            const MIN_SPAWN_DISTANCE_SQ = 100 * 100;
            for (const playerPos of occupiedPositions) {
                const dx = spawnPos.x - playerPos.x;
                const dy = spawnPos.y - playerPos.y;
                const dz = spawnPos.z - playerPos.z;
                if (dx * dx + dy * dy + dz * dz < MIN_SPAWN_DISTANCE_SQ) {
                    return true;
                }
            }
            return false;
        };

        let availableSpawns = candidateSpawns.filter((sp) => !isOccupied(sp.position));

        if (availableSpawns.length === 0) {
            logger.warn(`All candidate spawn points are occupied. Using any candidate as fallback.`);
            availableSpawns = candidateSpawns;
        }

        const randomIndex = Math.floor(Math.random() * availableSpawns.length);
        const chosenSpawn = availableSpawns[randomIndex];

        return { position: chosenSpawn.position, rotation: chosenSpawn.rotation };
    }

    public broadcastSpectatorListUpdate(battle: Battle, excludeClient?: GameClient): void {
        const spectatorNames = battle.spectators.map((s) => s.username);
        const spectatorListString = spectatorNames.join("\n");
        const packet = new UpdateSpectatorListPacket(spectatorListString);

        for (const spectator of battle.spectators) {
            if (excludeClient && spectator.id === excludeClient.user?.id) {
                continue;
            }
            const spectatorClient = this.server.findClientByUsername(spectator.username);
            if (spectatorClient && spectatorClient.isSpectator) {
                spectatorClient.sendPacket(packet);
            }
        }
        logger.info(`Broadcasted spectator list update for battle ${battle.battleId}`);
    }

    public announceTankRemoval(user: UserDocument, battle: Battle): void {
        const remainingParticipants = battle.getAllParticipants().filter((p) => p.id !== user.id);

        const removeTankPacket = new RemoveTankPacket(user.username);
        remainingParticipants.forEach((participant) => {
            const client = this.server.findClientByUsername(participant.username);
            if (client) client.sendPacket(removeTankPacket);
        });

        if (battle.settings.battleMode === BattleMode.DM) {
            const disconnectPacket = new UserDisconnectedDmPacket(user.username);
            remainingParticipants.forEach((participant) => {
                const client = this.server.findClientByUsername(participant.username);
                if (client) client.sendPacket(disconnectPacket);
            });
        }
    }

    public async finalizeBattleExit(user: UserDocument, battle: Battle, friendsToNotify?: string[], isSpectator: boolean = false): Promise<void> {
        const client = this.server.findClientByUsername(user.username);
        const lastPosition = client?.battlePosition ?? null;
        this.dropFlag(user, battle, lastPosition);

        if (!isSpectator) {
            const battleDetailWatchers = this.server.getClients().filter((c) => (c.getState() === "chat_lobby" || c.getState() === "battle_lobby") && c.lastViewedBattleId === battle.battleId);
            if (battleDetailWatchers.length > 0) {
                const removeUserPacket = new LobbyPackets.RemoveUserFromBattleLobbyPacket({ battleId: battle.battleId, nickname: user.username });
                for (const watcher of battleDetailWatchers) {
                    watcher.sendPacket(removeUserPacket);
                }
            }

            if (battle.settings.battleMode === BattleMode.DM) {
                const releaseSlotPacket = new LobbyPackets.ReleasePlayerSlotDmPacket({ battleId: battle.battleId, nickname: user.username });
                this.server.broadcastToBattleList(releaseSlotPacket);
            }
        }

        let friends: string[] = friendsToNotify || [];
        if (!friendsToNotify) {
            const populatedUser = await user.populate<{ friends: UserDocument[] }>("friends");
            friends = populatedUser.friends.map((f) => f.username);
        }

        if (friends.length > 0) {
            const userNotInBattlePacket = new LobbyPackets.UserNotInBattlePacket(user.username);
            for (const friendUsername of friends) {
                const friendClient = this.server.findClientByUsername(friendUsername);
                if (friendClient) {
                    friendClient.sendPacket(userNotInBattlePacket);
                }
            }
        }

        this.removeUserFromBattle(user, battle);
    }

    public handlePlayerDisconnection(user: UserDocument, battle: Battle, isSpectator: boolean): void {
        if (isSpectator) {
            logger.info(`Spectator ${user.username} disconnected from battle ${battle.battleId}. Finalizing immediately.`);
            this.finalizeDisconnection(user, battle, isSpectator);
        } else {
            logger.info(`Player ${user.username} disconnected from battle ${battle.battleId}. Starting 1-minute reconnect timer.`);
            this.announceTankRemoval(user, battle);

            const timeoutId = setTimeout(() => {
                logger.info(`Reconnect timer for ${user.username} expired. Finalizing disconnection.`);
                this.disconnectedPlayers.delete(user.id);
                this.finalizeDisconnection(user, battle, isSpectator);
            }, 60000);

            this.disconnectedPlayers.set(user.id, { battleId: battle.battleId, timeoutId });
        }
    }

    public handlePlayerReconnection(user: UserDocument): { battleId: string } | null {
        const disconnectedInfo = this.disconnectedPlayers.get(user.id);
        if (disconnectedInfo) {
            logger.info(`Player ${user.username} reconnected in time.`);
            clearTimeout(disconnectedInfo.timeoutId);
            this.disconnectedPlayers.delete(user.id);
            return { battleId: disconnectedInfo.battleId };
        }
        return null;
    }

    private async finalizeDisconnection(user: UserDocument, battle: Battle, isSpectator: boolean): Promise<void> {
        await this.finalizeBattleExit(user, battle, undefined, isSpectator);
    }

    public addUserToBattle(user: UserDocument, battleId: string, teamIndex: number): Battle {
        const battle = this.lobbyService.getBattleById(battleId);
        if (!battle) throw new Error("A batalha selecionada não existe mais.");

        const settings = battle.settings;
        if (user.rank < settings.minRank || user.rank > settings.maxRank) {
            throw new Error("Seu rank não é compatível com esta batalha.");
        }

        const allParticipants = battle.getAllParticipants();
        const isAlreadyInBattle = allParticipants.some((p) => p.id === user.id);

        if (isAlreadyInBattle) {
            throw new Error("Você já está nesta batalha.");
        }

        const activePlayersCount = battle.users.length + battle.usersBlue.length + battle.usersRed.length;
        if (activePlayersCount >= settings.maxPeopleCount) {
            throw new Error("Esta batalha está cheia.");
        }

        if (battle.isTeamMode()) {
            if (teamIndex === 0) battle.usersRed.push(user);
            else if (teamIndex === 1) battle.usersBlue.push(user);
            else throw new Error("Time inválido selecionado.");
        } else {
            battle.users.push(user);
        }

        if ([...battle.users, ...battle.usersBlue, ...battle.usersRed].length === 1 && !battle.roundStarted) {
            battle.roundStarted = true;
            battle.roundStartTime = Date.now();
            logger.info(`Round started for battle ${battle.battleId}.`);
        }

        logger.info(`User ${user.username} added to battle ${battle.battleId}`);
        return battle;
    }

    public addSpectatorToBattle(user: UserDocument, battleId: string): Battle {
        const battle = this.lobbyService.getBattleById(battleId);
        if (!battle) throw new Error("A batalha selecionada não existe mais.");

        const allParticipants = battle.getAllParticipants();
        const isAlreadyInBattle = allParticipants.some((p) => p.id === user.id);

        if (isAlreadyInBattle) {
            throw new Error("Você já está nesta batalha.");
        }

        battle.spectators.push(user);
        logger.info(`User ${user.username} added to battle ${battle.battleId} as a spectator`);

        return battle;
    }

    public removeUserFromBattle(user: UserDocument, battle: Battle): void {
        const userId = user.id;

        const wasSpectator = battle.spectators.some((s) => s.id === userId);

        battle.users = battle.users.filter((u) => u.id !== userId);
        battle.usersBlue = battle.usersBlue.filter((u) => u.id !== userId);
        battle.usersRed = battle.usersRed.filter((u) => u.id !== userId);
        battle.spectators = battle.spectators.filter((u) => u.id !== userId);

        if (wasSpectator) {
            this.broadcastSpectatorListUpdate(battle);
        }

        if ([...battle.users, ...battle.usersBlue, ...battle.usersRed].length === 0) {
            battle.roundStarted = false;
            battle.roundStartTime = null;
            this._clearFlagReturnTimer(battle, "RED");
            this._clearFlagReturnTimer(battle, "BLUE");
            logger.info(`Battle ${battle.battleId} is now empty. Round stopped and timer reset.`);
        }

        logger.info(`User ${user.username} removed from battle ${battle.battleId}`);
    }

    public takeFlag(user: UserDocument, battle: Battle, flagTeam: "RED" | "BLUE"): void {
        const teamId = flagTeam === "RED" ? 0 : 1;

        const isOnRedTeam = battle.usersRed.some((u) => u.id === user.id);
        const isOnBlueTeam = battle.usersBlue.some((u) => u.id === user.id);

        if ((flagTeam === "RED" && isOnRedTeam) || (flagTeam === "BLUE" && isOnBlueTeam)) {
            throw new Error("Cannot take your own team's flag.");
        }

        const flagPositionProp = flagTeam === "RED" ? "flagPositionRed" : "flagPositionBlue";
        if (battle[flagPositionProp]) {
            this._clearFlagReturnTimer(battle, flagTeam);
        }

        if (flagTeam === "RED") {
            if (battle.flagCarrierRed) throw new Error("Red flag is already taken.");
            battle.flagCarrierRed = user;
            battle.flagPositionRed = null;
        } else {
            if (battle.flagCarrierBlue) throw new Error("Blue flag is already taken.");
            battle.flagCarrierBlue = user;
            battle.flagPositionBlue = null;
        }

        logger.info(`User ${user.username} took the ${flagTeam} flag in battle ${battle.battleId}`);

        const takeFlagPacket = new TakeFlagPacket(user.username, teamId);
        this.broadcastToBattle(battle, takeFlagPacket);
    }

    public dropFlag(user: UserDocument, battle: Battle, dropPosition: IVector3 | null): void {
        if (!dropPosition) {
            logger.warn(`Attempted to drop flag for ${user.username} but no drop position was provided.`);
            return;
        }

        let droppedTeamId: number | null = null;
        let teamName: string | null = null;

        if (battle.flagCarrierRed?.id === user.id) {
            battle.flagCarrierRed = null;
            battle.flagPositionRed = dropPosition;
            droppedTeamId = 0;
            teamName = "RED";
        } else if (battle.flagCarrierBlue?.id === user.id) {
            battle.flagCarrierBlue = null;
            battle.flagPositionBlue = dropPosition;
            droppedTeamId = 1;
            teamName = "BLUE";
        }

        if (droppedTeamId !== null) {
            logger.info(`User ${user.username} dropped the ${teamName} flag in battle ${battle.battleId} at ${JSON.stringify(dropPosition)}`);
            const dropFlagPacket = new DropFlagPacket(dropPosition, droppedTeamId);
            this.broadcastToBattle(battle, dropFlagPacket);

            const flagTeamTyped = teamName as "RED" | "BLUE";
            this._clearFlagReturnTimer(battle, flagTeamTyped);
            const timerProp = flagTeamTyped === "RED" ? "flagReturnTimerRed" : "flagReturnTimerBlue";

            battle[timerProp] = setTimeout(() => {
                this.returnFlagToBase(battle, flagTeamTyped);
            }, 30000);

            logger.info(`Started 30s auto-return timer for ${teamName} flag in battle ${battle.battleId}`);
        }
    }
}