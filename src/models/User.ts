import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { Achievement } from "./enums/Achievement";
import { ChatModeratorLevel } from "./enums/ChatModeratorLevel";

export interface IUserQuest {
  questId: number;
  definitionId: string;
  progress: number;
  prizes: { itemName: string; itemCount: number }[];
  isCompleted: boolean;
  canSkipForFree: boolean;
}

const UserQuestSchema = new Schema<IUserQuest>({
  questId: { type: Number, required: true },
  definitionId: { type: String, required: true },
  progress: { type: Number, default: 0 },
  prizes: [{ itemName: { type: String, required: true }, itemCount: Number }],
  isCompleted: { type: Boolean, default: false },
  canSkipForFree: { type: Boolean, default: true },
});

export interface UserAttributes {
  username: string;
  password: string;
  email?: string | null;
  emailConfirmed: boolean;
  crystals: number;
  experience: number;
  isActive: boolean;
  isPunished: boolean;
  punishmentExpiresAt: Date | null;
  punishmentReason: string | null;
  hasDoubleCrystal: boolean;
  premiumExpiresAt: Date | null;
  rank: number;
  nextRankScore: number;
  crystalAbonementExpiresAt: Date | null;
  friends: mongoose.Types.ObjectId[];
  friendRequestsSent: mongoose.Types.ObjectId[];
  friendRequestsReceived: mongoose.Types.ObjectId[];
  newFriends: mongoose.Types.ObjectId[];
  newFriendRequests: mongoose.Types.ObjectId[];
  unlockedAchievements: number[];
  referralHash: string;
  referredBy: mongoose.Types.ObjectId | null;
  chatModeratorLevel: ChatModeratorLevel;
  lastMessageTimestamp: Date | null;
  notificationsEnabled: boolean;
  dailyQuests: IUserQuest[];
  questLevel: number;
  questStreak: number;
  lastQuestCompletedDate: Date | null;
  lastQuestGeneratedDate: Date | null;
  createdAt?: Date;
  lastLogin?: Date | null;
}

export interface UserDocument extends UserAttributes, Document {
  verifyPassword(password: string, callback: (error: Error | undefined, isMatch?: boolean) => void): void;
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50, match: /^[a-zA-Z0-9]+$/ },
  password: { type: String, required: true, minlength: 3 },
  email: { type: String, trim: true, lowercase: true, default: null },
  emailConfirmed: { type: Boolean, default: false },
  crystals: { type: Number, default: 0, min: 0 },
  experience: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  isPunished: { type: Boolean, default: false },
  punishmentExpiresAt: { type: Date, default: null },
  punishmentReason: { type: String, default: null },
  hasDoubleCrystal: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  rank: { type: Number, default: 1 },
  nextRankScore: { type: Number, default: 100 },
  crystalAbonementExpiresAt: { type: Date, default: null },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequestsSent: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequestsReceived: [{ type: Schema.Types.ObjectId, ref: "User" }],
  newFriends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  newFriendRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  unlockedAchievements: { type: [Number], default: [] },
  referralHash: { type: String, required: true, unique: true },
  referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  chatModeratorLevel: { type: Number, enum: [0, 1, 2, 3, 4], default: ChatModeratorLevel.NONE },
  lastMessageTimestamp: { type: Date, default: null },
  notificationsEnabled: { type: Boolean, default: true },
  dailyQuests: { type: [UserQuestSchema], default: [] },
  questLevel: { type: Number, default: 1 },
  questStreak: { type: Number, default: 0 },
  lastQuestCompletedDate: { type: Date, default: null },
  lastQuestGeneratedDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
});

UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: "string" } } });

UserSchema.pre<UserDocument>("save", function (next: (error?: Error) => void) {
  if (!this.isModified("password")) {
    return next();
  }
  bcrypt.hash(this.password, 10, (err: Error | undefined, hash: string) => {
    if (err) return next(err);
    this.password = hash;
    next();
  });
});

UserSchema.methods.verifyPassword = function (password: string, callback: (error: Error | undefined, isMatch?: boolean) => void): void {
  bcrypt.compare(password, this.password, (error: Error | undefined, isMatch: boolean) => {
    if (error) return callback(error);
    callback(undefined, isMatch);
  });
};

const User = model<UserDocument>("User", UserSchema);

export default User;
