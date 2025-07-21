import User, { UserDocument } from "@/shared/models/user.model";
import { UserService } from "@/shared/services/UserService";
import logger from "@/utils/Logger";
import mongoose from "mongoose";
import { IFriendsListProps } from "./friends.types";

export class FriendsService {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async sendFriendRequest(senderUser: UserDocument, targetNickname: string): Promise<UserDocument> {
        const targetUser = await this.userService.findUserByUsername(targetNickname);

        if (!targetUser) {
            throw new Error(`Usuário "${targetNickname}" não encontrado.`);
        }

        const senderId = senderUser._id as mongoose.Types.ObjectId;
        const targetId = targetUser._id as mongoose.Types.ObjectId;

        if (senderId.equals(targetId)) {
            throw new Error("Você não pode adicionar a si mesmo como amigo.");
        }

        if (senderUser.friends.some((friendId) => friendId.equals(targetId))) {
            throw new Error("ALREADY_FRIENDS");
        }

        if (senderUser.friendRequestsSent.some((friendId) => friendId.equals(targetId))) {
            throw new Error("REQUEST_ALREADY_SENT");
        }

        if (senderUser.friendRequestsReceived.some((friendId) => friendId.equals(targetId))) {
            throw new Error("INCOMING_REQUEST_EXISTS");
        }

        senderUser.friendRequestsSent.push(targetId);
        targetUser.friendRequestsReceived.push(senderId);
        targetUser.newFriendRequests.push(senderId);

        await senderUser.save();
        await targetUser.save();

        logger.info(`Friend request sent from ${senderUser.username} to ${targetUser.username}`);
        return targetUser;
    }

    public async cancelFriendRequest(senderUser: UserDocument, targetNickname: string): Promise<UserDocument> {
        const targetUser = await this.userService.findUserByUsername(targetNickname);
        if (!targetUser) {
            throw new Error(`Usuário "${targetNickname}" não encontrado.`);
        }

        const senderId = senderUser._id as mongoose.Types.ObjectId;
        const targetId = targetUser._id as mongoose.Types.ObjectId;

        if (!senderUser.friendRequestsSent.some((id) => id.equals(targetId))) {
            throw new Error(`Você não enviou um pedido de amizade para "${targetNickname}".`);
        }

        senderUser.friendRequestsSent = senderUser.friendRequestsSent.filter((id) => !id.equals(targetId));
        targetUser.friendRequestsReceived = targetUser.friendRequestsReceived.filter((id) => !id.equals(senderId));
        targetUser.newFriendRequests = targetUser.newFriendRequests.filter((id) => !id.equals(senderId));

        await senderUser.save();
        await targetUser.save();

        logger.info(`User ${senderUser.username} canceled friend request to ${targetUser.username}.`);
        return targetUser;
    }

    public async declineAllFriendRequests(user: UserDocument): Promise<UserDocument[]> {
        const populatedUser = await user.populate<{ friendRequestsReceived: UserDocument[] }>("friendRequestsReceived");

        const receivedRequests = populatedUser.friendRequestsReceived;
        if (receivedRequests.length === 0) {
            return [];
        }

        const senderIds: mongoose.Types.ObjectId[] = receivedRequests.map((sender) => sender._id as mongoose.Types.ObjectId);

        user.friendRequestsReceived = [];
        user.newFriendRequests = [];
        await user.save();

        await User.updateMany({ _id: { $in: senderIds } }, { $pull: { friendRequestsSent: user._id as mongoose.Types.ObjectId } });

        logger.info(`User ${user.username} declined all ${receivedRequests.length} friend requests.`);

        return receivedRequests;
    }

    public async declineFriendRequest(user: UserDocument, senderNickname: string): Promise<UserDocument> {
        const senderUser = await this.userService.findUserByUsername(senderNickname);

        if (!senderUser) {
            throw new Error(`Usuário "${senderNickname}" não encontrado.`);
        }

        const userId = user._id as mongoose.Types.ObjectId;
        const senderId = senderUser._id as mongoose.Types.ObjectId;

        if (!user.friendRequestsReceived.some((id) => id.equals(senderId))) {
            throw new Error(`Nenhum pedido de amizade de "${senderNickname}" para ser recusado.`);
        }

        user.friendRequestsReceived = user.friendRequestsReceived.filter((id) => !id.equals(senderId));
        user.newFriendRequests = user.newFriendRequests.filter((id) => !id.equals(senderId));
        senderUser.friendRequestsSent = senderUser.friendRequestsSent.filter((id) => !id.equals(userId));

        await user.save();
        await senderUser.save();

        logger.info(`User ${user.username} declined friend request from ${senderUser.username}.`);
        return senderUser;
    }

    public async acceptFriendRequest(user: UserDocument, senderNickname: string): Promise<UserDocument> {
        const senderUser = await this.userService.findUserByUsername(senderNickname);

        if (!senderUser) {
            throw new Error(`Usuário "${senderNickname}" não encontrado.`);
        }

        const userId = user._id as mongoose.Types.ObjectId;
        const senderId = senderUser._id as mongoose.Types.ObjectId;

        if (!user.friendRequestsReceived.some((id) => id.equals(senderId))) {
            throw new Error(`Nenhum pedido de amizade de "${senderNickname}" para aceitar.`);
        }

        user.friendRequestsReceived = user.friendRequestsReceived.filter((id) => !id.equals(senderId));
        user.newFriendRequests = user.newFriendRequests.filter((id) => !id.equals(senderId));
        senderUser.friendRequestsSent = senderUser.friendRequestsSent.filter((id) => !id.equals(userId));

        user.friends.push(senderId);
        senderUser.friends.push(userId);

        user.newFriends.push(senderId);
        senderUser.newFriends.push(userId);

        await user.save();
        await senderUser.save();

        logger.info(`User ${user.username} accepted friend request from ${senderUser.username}. They are now friends.`);

        return senderUser;
    }

    public async removeFriend(user: UserDocument, friendNickname: string): Promise<UserDocument> {
        const friend = await this.userService.findUserByUsername(friendNickname);
        if (!friend) {
            throw new Error(`Amigo "${friendNickname}" não encontrado.`);
        }

        const userId = user._id as mongoose.Types.ObjectId;
        const friendId = friend._id as mongoose.Types.ObjectId;

        if (!user.friends.some((id) => id.equals(friendId))) {
            throw new Error(`"${friend.username}" não está na sua lista de amigos.`);
        }

        user.friends = user.friends.filter((id) => !id.equals(friendId));
        user.newFriends = user.newFriends.filter((id) => !id.equals(friendId));

        friend.friends = friend.friends.filter((id) => !id.equals(userId));
        friend.newFriends = friend.newFriends.filter((id) => !id.equals(userId));

        await user.save();
        await friend.save();

        logger.info(`User ${user.username} removed ${friend.username} from friends.`);
        return friend;
    }

    public async acknowledgeNewFriend(user: UserDocument, friendNickname: string): Promise<UserDocument> {
        const friend = await this.userService.findUserByUsername(friendNickname);
        if (!friend) {
            throw new Error(`Amigo "${friendNickname}" não encontrado.`);
        }

        const friendId = friend._id as mongoose.Types.ObjectId;

        if (!user.newFriends.some((id) => id.equals(friendId))) {
            logger.warn(`User ${user.username} tried to acknowledge a non-new friend ${friend.username}.`);
            return friend;
        }

        user.newFriends = user.newFriends.filter((id) => !id.equals(friendId));
        await user.save();
        logger.info(`User ${user.username} acknowledged new friend ${friend.username}.`);
        return friend;
    }

    public async acknowledgeNewFriendRequest(user: UserDocument, senderNickname: string): Promise<UserDocument> {
        const sender = await this.userService.findUserByUsername(senderNickname);
        if (!sender) {
            throw new Error(`Usuário "${senderNickname}" não encontrado.`);
        }

        const senderId = sender._id as mongoose.Types.ObjectId;

        if (!user.newFriendRequests.some((id) => id.equals(senderId))) {
            logger.warn(`User ${user.username} tried to acknowledge a non-new friend request from ${sender.username}.`);
            return sender;
        }

        user.newFriendRequests = user.newFriendRequests.filter((id) => !id.equals(senderId));
        await user.save();
        logger.info(`User ${user.username} acknowledged new friend request from ${sender.username}.`);
        return sender;
    }

    public async getFriendsData(userId: string): Promise<IFriendsListProps> {
        const user = await User.findById(userId).populate("friends", "username").populate("friendRequestsSent", "username").populate("friendRequestsReceived", "username").populate("newFriends", "username").populate("newFriendRequests", "username").exec();

        if (!user) {
            throw new Error("User not found for fetching friends data.");
        }

        const pluckUsername = (doc: any): string => doc.username;

        return {
            acceptedFriends: user.friends.map(pluckUsername),
            newAcceptedFriends: user.newFriends.map(pluckUsername),
            incomingRequests: user.friendRequestsReceived.map(pluckUsername),
            newIncomingRequests: user.newFriendRequests.map(pluckUsername),
            outgoingRequests: user.friendRequestsSent.map(pluckUsername),
        };
    }
}