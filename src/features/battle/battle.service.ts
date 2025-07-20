import { UserDocument } from "../../models/User";
import { Battle, BattleMode, MapTheme } from "./battle.model";
import logger from "../../utils/Logger";
import { ProTankiServer } from "../../server/ProTankiServer";
import RemoveTankPacket from "../../packets/implementations/RemoveTankPacket";
import UserDisconnectedDmPacket from "../../packets/implementations/UserDisconnectedDmPacket";
import UpdateSpectatorListPacket from "../../packets/implementations/UpdateSpectatorListPacket";
import { ProTankiClient } from "../../server/ProTankiClient";
import { mapSpawns } from "../../types/mapSpawns";
import { IVector3 } from "../../packets/interfaces/geom/IVector3";
import { mapGeometries } from "../../types/mapGeometries";
import DestroyTankPacket from "../../packets/implementations/DestroyTankPacket";
import SystemMessage from "../../packets/implementations/SystemMessage";
import { LobbyService } from "../lobby/lobby.service";
import * as LobbyPackets from "../lobby/lobby.packets";

interface IDisconnectedPlayerInfo {
    battleId: string;
    timeoutId: NodeJS.Timeout;
}

export class BattleService {
    private disconnectedPlayers = new Map<string, IDisconnectedPlayerInfo>();
    private server: ProTankiServer;
    private lobbyService: LobbyService;

    constructor(server: ProTankiServer, lobbyService: LobbyService) {
        this.server = server;
        this.lobbyService = lobbyService;
    }

    public checkPlayerPosition(client: ProTankiClient): void {
        const { user, currentBattle, battlePosition } = client;
        if (!user || !currentBattle || !battlePosition) return;

        const mapId = currentBattle.settings.mapId.replace("map_", "");
        const themeStr = MapTheme[currentBattle.settings.mapTheme].toLowerCase();
        const mapResourceId = `map/${mapId}/${themeStr}/xml`;

        const geometries = mapGeometries[mapResourceId];
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
                this.handleSpecialGeometryAction(client, box.action);
                break;
            }
        }
    }

    private handleSpecialGeometryAction(client: ProTankiClient, action: "kill" | "kick"): void {
        const { user, currentBattle } = client;
        if (!user || !currentBattle) return;

        logger.info(`User ${user.username} entered a special geometry zone with action: ${action}`);

        if (action === "kill") {
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
            client.sendPacket(new SystemMessage("Você foi kickado por entrar em uma área proibida."));
            setTimeout(() => client.closeConnection(), 100);
        }
    }

    public getSpawnPoint(battle: Battle, team: "DM" | "BLUE" | "RED"): { position: IVector3; rotation: IVector3 } {
        const mapId = battle.settings.mapId.replace("map_", "");
        const themeStr = MapTheme[battle.settings.mapTheme].toLowerCase();
        const mapResourceId = `map/${mapId}/${themeStr}/xml`;

        const allMapSpawns = mapSpawns[mapResourceId];
        if (!allMapSpawns || allMapSpawns.length === 0) {
            logger.warn(`No spawn points found for map ${mapResourceId}. Using fallback.`);
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
            logger.warn(`No specific spawn points of type for this mode on map ${mapResourceId}. Using all available as fallback.`);
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

    public broadcastSpectatorListUpdate(battle: Battle, excludeClient?: ProTankiClient): void {
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
            logger.info(`Battle ${battle.battleId} is now empty. Round stopped and timer reset.`);
        }

        logger.info(`User ${user.username} removed from battle ${battle.battleId}`);
    }
}