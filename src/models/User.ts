import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";
import { Achievement } from "./enums/Achievement";
import { ChatModeratorLevel } from "./enums/ChatModeratorLevel";

export interface UserAttributes {
  username: string;
  password: string;
  email?: string | null;
  emailConfirmed: boolean;
  crystals: number;
  experience: number;
  level: number;
  isActive: boolean;
  isPunished: boolean;
  punishmentExpiresAt: Date | null;
  punishmentReason: string | null;
  hasDoubleCrystal: boolean;
  premiumExpiresAt: Date | null;
  rank: number;
  score: number;
  nextRankScore: number;
  crystalAbonementExpiresAt: Date | null;
  friends: mongoose.Types.ObjectId[];
  friendRequestsSent: mongoose.Types.ObjectId[];
  friendRequestsReceived: mongoose.Types.ObjectId[];
  unlockedAchievements: number[];
  referralHash: string;
  chatModeratorLevel: ChatModeratorLevel;
  lastMessageTimestamp: Date | null;
  createdAt?: Date;
  lastLogin?: Date | null;
}

export interface UserDocument extends UserAttributes, Document {
  verifyPassword(password: string, callback: (error: Error | undefined, isMatch?: boolean) => void): void;
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 50, match: /^[a-zA-Z0-9]+$/ },
  password: { type: String, required: true, minlength: 3 },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
  },
  emailConfirmed: { type: Boolean, default: false },
  crystals: { type: Number, default: 0, min: 0 },
  experience: { type: Number, default: 0, min: 0 },
  level: { type: Number, default: 1, min: 1 },
  isActive: { type: Boolean, default: true },
  isPunished: { type: Boolean, default: false },
  punishmentExpiresAt: { type: Date, default: null },
  punishmentReason: { type: String, default: null },
  hasDoubleCrystal: { type: Boolean, default: false },
  premiumExpiresAt: { type: Date, default: null },
  rank: { type: Number, default: 1 },
  score: { type: Number, default: 0 },
  nextRankScore: { type: Number, default: 100 },
  crystalAbonementExpiresAt: { type: Date, default: null },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequestsSent: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequestsReceived: [{ type: Schema.Types.ObjectId, ref: "User" }],
  unlockedAchievements: { type: [Number], default: [] },
  referralHash: { type: String, required: true, unique: true },
  chatModeratorLevel: { type: Number, enum: [0, 1, 2, 3, 4], default: ChatModeratorLevel.NONE },
  lastMessageTimestamp: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
});

// Criando um índice parcial para o campo de e-mail
// Isso garante que o e-mail seja único, mas apenas para documentos que possuem o campo de e-mail.
// Documentos com e-mail nulo são ignorados por este índice.
UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string" } },
  }
);

UserSchema.pre<UserDocument>("save", function (next: (error?: Error) => void) {
  if (!this.isModified("password")) {
    return next();
  }
  bcrypt.hash(this.password, 10, (err: Error | undefined, hash: string) => {
    if (err) {
      return next(err);
    }
    this.password = hash;
    next();
  });
});

UserSchema.methods.verifyPassword = function (password: string, callback: (error: Error | undefined, isMatch?: boolean) => void): void {
  bcrypt.compare(password, this.password, (error: Error | undefined, isMatch: boolean) => {
    if (error) {
      return callback(error);
    }
    callback(undefined, isMatch);
  });
};

const User = model<UserDocument>("User", UserSchema);

export default User;
