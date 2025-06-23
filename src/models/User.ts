import mongoose, { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface UserAttributes {
  username: string;
  password: string;
  email?: string | null;
  crystals: number;
  experience: number;
  level: number;
  isActive: boolean;
  isPunished: boolean;
  punishmentExpiresAt: Date | null;
  punishmentReason: string | null;
  createdAt?: Date;
  lastLogin?: Date | null;
}

export interface UserDocument extends UserAttributes, Document {
  verifyPassword(password: string, callback: (error: Error | undefined, isMatch?: boolean) => void): void;
}

const UserSchema = new Schema<UserDocument>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    match: /^[a-zA-Z0-9]+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 3,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please fill a valid email address"],
    default: null,
  },
  crystals: {
    type: Number,
    default: 0,
    min: 0,
  },
  experience: {
    type: Number,
    default: 0,
    min: 0,
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isPunished: {
    type: Boolean,
    default: false,
  },
  punishmentExpiresAt: {
    type: Date,
    default: null,
  },
  punishmentReason: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

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
