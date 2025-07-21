import { SystemMessage } from "@/features/system/system.packets";
import { GameClient } from "@/server/game.client";
import { GameServer } from "@/server/game.server";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import logger from "@/utils/logger";
import * as FriendPackets from "./friends.packets";

export class AcceptFriendRequestHandler implements IPacketHandler<FriendPackets.AcceptFriendRequest> {
    public readonly packetId = FriendPackets.AcceptFriendRequest.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.AcceptFriendRequest): Promise<void> {
        const currentUser = client.user;
        if (!currentUser || !packet.nickname) {
            return;
        }

        try {
            const senderUser = await server.friendsService.acceptFriendRequest(currentUser, packet.nickname);
            const updatedUser = await server.userService.findUserByUsername(currentUser.username);
            if (updatedUser) client.user = updatedUser;

            client.sendPacket(new FriendPackets.FriendRequestAccepted(senderUser.username));

            const senderClient = server.findClientByUsername(senderUser.username);
            if (senderClient) {
                senderClient.user = senderUser;
                senderClient.sendPacket(new FriendPackets.FriendRequestAccepted(currentUser.username));
                if (!senderClient.friendsCache.includes(currentUser.username)) senderClient.friendsCache.push(currentUser.username);
            }

            if (!client.friendsCache.includes(senderUser.username)) client.friendsCache.push(senderUser.username);
        } catch (error: any) {
            logger.error(`Failed to accept friend request for ${currentUser.username} from ${packet.nickname}`, { error: error.message });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class AcknowledgeNewFriendHandler implements IPacketHandler<FriendPackets.AcknowledgeNewFriend> {
    public readonly packetId = FriendPackets.AcknowledgeNewFriend.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.AcknowledgeNewFriend): Promise<void> {
        if (!client.user || !packet.nickname) return;
        try {
            const friend = await server.friendsService.acknowledgeNewFriend(client.user, packet.nickname);
            client.sendPacket(new FriendPackets.AcknowledgeNewFriend(friend.username));
        } catch (error: any) {
            logger.error(`Failed to acknowledge new friend for ${client.user.username}`, { error: error.message });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class AcknowledgeNewFriendRequestHandler implements IPacketHandler<FriendPackets.AcknowledgeNewFriendRequest> {
    public readonly packetId = FriendPackets.AcknowledgeNewFriendRequest.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.AcknowledgeNewFriendRequest): Promise<void> {
        if (!client.user || !packet.nickname) return;
        try {
            const sender = await server.friendsService.acknowledgeNewFriendRequest(client.user, packet.nickname);
            client.sendPacket(new FriendPackets.AcknowledgeNewFriendRequest(sender.username));
        } catch (error: any) {
            logger.error(`Failed to acknowledge new friend request for ${client.user.username}`, { error: error.message });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class CancelFriendRequestHandler implements IPacketHandler<FriendPackets.CancelFriendRequest> {
    public readonly packetId = FriendPackets.CancelFriendRequest.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.CancelFriendRequest): Promise<void> {
        if (!client.user || !packet.nickname) return;
        try {
            const targetUser = await server.friendsService.cancelFriendRequest(client.user, packet.nickname);
            client.sendPacket(new FriendPackets.FriendRequestCanceledOrDeclined(targetUser.username));
            const targetClient = server.findClientByUsername(targetUser.username);
            if (targetClient) {
                targetClient.user = targetUser;
                targetClient.sendPacket(new FriendPackets.FriendRequestCanceledOrDeclined(client.user.username));
            }
        } catch (error: any) {
            logger.error(`Failed to cancel friend request from ${client.user.username} to ${packet.nickname}`, { error: error.message });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class CheckUserExistsForFriendHandler implements IPacketHandler<FriendPackets.CheckUserExistsForFriend> {
    public readonly packetId = FriendPackets.CheckUserExistsForFriend.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.CheckUserExistsForFriend): Promise<void> {
        if (!packet.nickname) {
            client.sendPacket(new FriendPackets.UserInvalidForFriend());
            return;
        }
        const userExists = !(await server.userService.isUsernameAvailable(packet.nickname));
        client.sendPacket(userExists ? new FriendPackets.UserExistsForFriend() : new FriendPackets.UserInvalidForFriend());
    }
}

export class DeclineAllFriendRequestsHandler implements IPacketHandler<FriendPackets.DeclineAllFriendRequests> {
    public readonly packetId = FriendPackets.DeclineAllFriendRequests.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.DeclineAllFriendRequests): Promise<void> {
        if (!client.user) return;
        try {
            const declinedSenders = await server.friendsService.declineAllFriendRequests(client.user);
            for (const sender of declinedSenders) {
                client.sendPacket(new FriendPackets.FriendRequestDeclined(sender.username));
                const senderClient = server.findClientByUsername(sender.username);
                if (senderClient) {
                    senderClient.user = sender;
                    senderClient.sendPacket(new FriendPackets.FriendRequestCanceledOrDeclined(client.user.username));
                }
            }
        } catch (error: any) {
            logger.error(`Failed to decline all friend requests for ${client.user.username}`, { error: error.message });
        }
    }
}

export class DeclineFriendRequestHandler implements IPacketHandler<FriendPackets.DeclineFriendRequest> {
    public readonly packetId = FriendPackets.DeclineFriendRequest.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.DeclineFriendRequest): Promise<void> {
        if (!client.user || !packet.nickname) return;
        try {
            const senderUser = await server.friendsService.declineFriendRequest(client.user, packet.nickname);
            client.sendPacket(new FriendPackets.FriendRequestDeclined(senderUser.username));
            const senderClient = server.findClientByUsername(senderUser.username);
            if (senderClient) {
                senderClient.user = senderUser;
                senderClient.sendPacket(new FriendPackets.FriendRequestCanceledOrDeclined(client.user.username));
            }
        } catch (error: any) {
            logger.error(`Failed to decline friend request for ${client.user.username} from ${packet.nickname}`, { error: error.message });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class LoadFriendsHandler implements IPacketHandler<FriendPackets.LoadFriends> {
    public readonly packetId = FriendPackets.LoadFriends.getId();
    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.LoadFriends): Promise<void> {
        if (!client.user) return;

        const friendsData = await server.friendsService.getFriendsData(client.user.id);
        client.sendPacket(new FriendPackets.FriendsList(friendsData));
    }
}

export class RemoveFriendHandler implements IPacketHandler<FriendPackets.RemoveFriend> {
    public readonly packetId = FriendPackets.RemoveFriend.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.RemoveFriend): Promise<void> {
        const currentUser = client.user;
        if (!currentUser || !packet.nickname) return;

        try {
            const removedFriend = await server.friendsService.removeFriend(currentUser, packet.nickname);
            const updatedUser = await server.userService.findUserByUsername(currentUser.username);
            if (updatedUser) client.user = updatedUser;

            client.sendPacket(new FriendPackets.FriendRemoved(removedFriend.username));
            client.friendsCache = client.friendsCache.filter((friend) => friend !== removedFriend.username);

            const removedFriendClient = server.findClientByUsername(removedFriend.username);
            if (removedFriendClient) {
                removedFriendClient.user = removedFriend;
                removedFriendClient.sendPacket(new FriendPackets.FriendRemoved(currentUser.username));
                removedFriendClient.friendsCache = removedFriendClient.friendsCache.filter((friend) => friend !== currentUser.username);
            }
        } catch (error: any) {
            logger.error(`Failed to remove friend for ${currentUser.username}`, { error: error.message });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class SendFriendRequestHandler implements IPacketHandler<FriendPackets.SendFriendRequest> {
    public readonly packetId = FriendPackets.SendFriendRequest.getId();

    public async execute(client: GameClient, server: GameServer, packet: FriendPackets.SendFriendRequest): Promise<void> {
        if (!client.user || !packet.nickname) return;
        try {
            const targetUser = await server.friendsService.sendFriendRequest(client.user, packet.nickname);
            client.sendPacket(new FriendPackets.FriendRequestSent(targetUser.username));
            const targetClient = server.findClientByUsername(targetUser.username);
            if (targetClient) {
                targetClient.user = targetUser;
                targetClient.sendPacket(new FriendPackets.NewFriendRequest(client.user.username));
            }
        } catch (error: any) {
            const targetUser = await server.userService.findUserByUsername(packet.nickname);
            const canonicalNickname = targetUser ? targetUser.username : packet.nickname;
            switch (error.message) {
                case "ALREADY_FRIENDS":
                    client.sendPacket(new FriendPackets.AlreadyFriends(canonicalNickname));
                    break;
                case "REQUEST_ALREADY_SENT":
                    client.sendPacket(new FriendPackets.FriendRequestAlreadySent(canonicalNickname));
                    break;
                case "INCOMING_REQUEST_EXISTS":
                    client.sendPacket(new FriendPackets.IncomingFriendRequestExists(canonicalNickname));
                    break;
                default:
                    logger.warn(`Failed to send friend request from ${client.user.username} to ${packet.nickname}`, { error: error.message });
                    client.sendPacket(new SystemMessage(error.message));
            }
        }
    }
}

export class RequestFriendsListWindowHandler implements IPacketHandler<FriendPackets.RequestFriendsListWindow> {
    public readonly packetId = FriendPackets.RequestFriendsListWindow.getId();

    public execute(client: GameClient, server: GameServer): void {
        if (!client.user) {
            logger.warn("RequestFriendsListWindow received from unauthenticated client.", { client: client.getRemoteAddress() });
            return;
        }

        client.sendPacket(new FriendPackets.ShowFriendsListWindow());
    }
}