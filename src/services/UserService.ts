import User, { UserAttributes, UserDocument } from "../models/User";
import Invite from "../models/Invite";
import logger from "../utils/Logger";

export interface UserCreationAttributes {
  username: string;
  password: string;
  email?: string | null;
  crystals?: number;
  experience?: number;
  level?: number;
  isActive?: boolean;
}

export class UserService {
  public static async findUserByUsername(username: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({
        username: { $regex: new RegExp(`^${username}$`, "i") },
      });
    } catch (error) {
      logger.error(`Error finding user by username ${username}`, { error });
      throw error;
    }
  }

  public static async findUserByEmail(email: string): Promise<UserDocument | null> {
    try {
      return await User.findOne({ email });
    } catch (error) {
      logger.error(`Error finding user by email ${email}`, { error });
      throw error;
    }
  }

  public static async isUsernameAvailable(username: string): Promise<boolean> {
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

  public static async generateUsernameSuggestions(baseUsername: string): Promise<string[]> {
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

  public static async createUser(attributes: UserCreationAttributes): Promise<UserDocument> {
    try {
      const isAvailable = await this.isUsernameAvailable(attributes.username);
      if (!isAvailable) {
        throw new Error(`Username ${attributes.username} already exists`);
      }

      const user = new User({
        username: attributes.username,
        password: attributes.password,
        email: attributes.email,
        crystals: attributes.crystals,
        experience: attributes.experience,
        level: attributes.level,
        isActive: attributes.isActive,
      });

      return await user.save();
    } catch (error) {
      logger.error(`Error creating user ${attributes.username}`, { error });
      throw error;
    }
  }

  public static async login(username: string, password: string, inviteCode: string | null): Promise<UserDocument> {
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

  public static async punishUser(username: string, durationMs: number, reason: string | null): Promise<UserDocument> {
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

  public static async updateResources(userId: string, updates: { crystals?: number; experience?: number; level?: number }): Promise<UserDocument> {
    try {
      const updateData: Partial<UserAttributes> = {};
      if (updates.crystals !== undefined && updates.crystals >= 0) {
        updateData.crystals = updates.crystals;
      }
      if (updates.experience !== undefined && updates.experience >= 0) {
        updateData.experience = updates.experience;
      }
      if (updates.level !== undefined && updates.level >= 1) {
        updateData.level = updates.level;
      }

      const user = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true });
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    } catch (error) {
      logger.error(`Error updating resources for user ID ${userId}`, { error });
      throw error;
    }
  }
}
