import User, { UserAttributes, UserDocument } from "../models/User";
import Invite from "../models/Invite";
import logger from "../utils/Logger";
import { IFriendsListProps } from "../packets/interfaces/IFriendsList";
import crypto from "crypto";
import mongoose from "mongoose";
import { RankService } from "./RankService";

export interface UserCreationAttributes {
  username: string;
  password: string;
  email?: string | null;
  crystals?: number;
  experience?: number;
}

export class UserService {
  private rankService: RankService;

  constructor(rankService: RankService) {
    this.rankService = rankService;
  }

  public async findUserByLoginToken(token: string): Promise<UserDocument | null> {
    if (!token) return null;
    try {
      return await User.findOne({ loginToken: token });
    } catch (error) {
      logger.error(`Error finding user by login token`, { error });
      throw error;
    }
  }

  public async generateAndSetLoginToken(user: UserDocument): Promise<string> {
    try {
      const token = crypto.randomBytes(16).toString("hex");
      user.loginToken = token;
      await user.save();
      logger.info(`Generated new login token for user ${user.username}`);
      return token;
    } catch (error) {
      logger.error(`Error generating login token for user ${user.username}`, { error });
      throw error;
    }
  }

  public async findUserByUsername(username: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
      });
    } catch (error) {
      logger.error(`Error finding user by username ${username}`, { error });
      throw error;
    }
  }

  public async findUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error(`Error finding user by email ${email}`, { error });
      throw error;
    }
  }

  public async isEmailInUse(email: string, userIdToExclude?: string): Promise<boolean> {
    try {
      const query: any = { email: email.toLowerCase() };
      if (userIdToExclude) {
        query._id = { $ne: userIdToExclude };
      }
      const user = await User.findOne(query);
      return !!user;
    } catch (error) {
      logger.error(`Error checking if email is in use: ${email}`, { error });
      throw error;
    }
  }

  public async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const user = await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
      });
      return !user;
    } catch (error) {
      logger.error(`Error checking username availability for ${username}`, { error });
      throw error;
    }
  }

  public async generateUsernameSuggestions(baseUsername: string): Promise<string[]> {
    const suggestions: string[] = [];
    const MAX_SUGGESTIONS = 5;

    for (let i = 1; suggestions.length < MAX_SUGGESTIONS; i++) {
      const suffix = Math.floor(Math.random() * 100) + i;
      const newName = `${baseUsername}${suffix}`;

      if (newName.length > 20) continue;

      const isAvailable = await this.isUsernameAvailable(newName);
      if (isAvailable) {
        suggestions.push(newName);
      }

      if (i > 20) break;
    }
    return suggestions;
  }

  public async createUser(attributes: UserCreationAttributes): Promise<UserDocument> {
    try {
      const isUsernameTaken = !(await this.isUsernameAvailable(attributes.username));
      if (isUsernameTaken) {
        throw new Error(`Username ${attributes.username} already exists`);
      }

      if (attributes.email) {
        const isEmailTaken = await this.isEmailInUse(attributes.email);
        if (isEmailTaken) {
          throw new Error(`Email ${attributes.email} already exists`);
        }
      }

      const initialRankData = this.rankService.getInitialRankData();

      const user = new User({
        username: attributes.username,
        password: attributes.password,
        email: attributes.email,
        emailConfirmed: false,
        crystals: attributes.crystals,
        experience: attributes.experience ?? initialRankData.score,
        rank: initialRankData.rank,
        nextRankScore: initialRankData.nextRankScore,
        isActive: true,
        referralHash: crypto.randomBytes(16).toString("hex"),
      });

      user.turrets.set("smoky", 0);
      user.hulls.set("wasp", 0);
      user.paints.push("green");

      return await user.save();
    } catch (error) {
      logger.error(`Error creating user ${attributes.username}`, { error });
      throw error;
    }
  }

  public async linkEmailToAccount(user: UserDocument, newEmail: string): Promise<UserDocument> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error("Formato de e-mail inválido.");
    }

    if (user.email && user.emailConfirmed) {
      throw new Error("Um e-mail verificado já está vinculado a esta conta.");
    }

    const isTaken = await this.isEmailInUse(newEmail, user.id);
    if (isTaken) {
      throw new Error("EMAIL_IN_USE");
    }

    user.email = newEmail;
    user.emailConfirmed = false;

    await user.save();
    logger.info(`User ${user.username} linked new email ${newEmail}.`);
    return user;
  }

  public async sendFriendRequest(senderUser: UserDocument, targetNickname: string): Promise<UserDocument> {
    const targetUser = await this.findUserByUsername(targetNickname);

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
    const targetUser = await this.findUserByUsername(targetNickname);
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
    const senderUser = await this.findUserByUsername(senderNickname);

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
    const senderUser = await this.findUserByUsername(senderNickname);

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
    const friend = await this.findUserByUsername(friendNickname);
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
    const friend = await this.findUserByUsername(friendNickname);
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
    const sender = await this.findUserByUsername(senderNickname);
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

  public async login(username: string, password: string, inviteCode: string | null): Promise<UserDocument> {
    try {
      const user = await this.findUserByUsername(username);

      if (!user) {
        throw new Error("Invalid username or password");
      }
      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      await new Promise<void>((resolve, reject) => {
        user.verifyPassword(password, (err, isMatch) => {
          if (err) return reject(err);
          if (!isMatch) return reject(new Error("Invalid username or password"));
          resolve();
        });
      });

      user.lastLogin = new Date();

      if (inviteCode) {
        const invite = await Invite.findOne({ code: inviteCode });
        if (!invite) {
          throw new Error("Invalid invite code");
        }
        if (invite.userId) {
          throw new Error("Invite code already used");
        }
        invite.userId = user._id as any;
        invite.player = username;
        await invite.save();
      }

      return await user.save();
    } catch (error) {
      logger.error(`Error during login for user ${username}`, { error });
      throw error;
    }
  }

  public async punishUser(username: string, durationMs: number, reason: string | null): Promise<UserDocument> {
    const user = await this.findUserByUsername(username);
    if (!user) {
      throw new Error(`User ${username} not found.`);
    }

    user.isPunished = true;
    user.punishmentExpiresAt = new Date(Date.now() + durationMs);
    user.punishmentReason = reason;

    await user.save();
    logger.info(`User ${username} has been punished`, {
      reason,
      expiresAt: user.punishmentExpiresAt,
    });

    return user;
  }

  public async updatePasswordByEmail(originalEmail: string, newPass: string, newEmail: string): Promise<UserDocument> {
    const user = await this.findUserByEmail(originalEmail);
    if (!user) {
      throw new Error(`User with email ${originalEmail} not found.`);
    }

    if (newEmail.toLowerCase() !== (user.email || "").toLowerCase()) {
      const isNewEmailTaken = await this.isEmailInUse(newEmail, user.id);
      if (isNewEmailTaken) {
        throw new Error(`Email ${newEmail} is already in use.`);
      }
      user.email = newEmail;
      user.emailConfirmed = false;
    }

    user.password = newPass;

    return await user.save();
  }

  public async updateResources(userId: string, updates: { crystals?: number; experience?: number }): Promise<UserDocument> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (updates.crystals !== undefined) {
      user.crystals = updates.crystals;
    }
    if (updates.experience !== undefined) {
      user.experience = updates.experience;
      this.rankService.updateRank(user);
    }

    return await user.save();
  }
}
