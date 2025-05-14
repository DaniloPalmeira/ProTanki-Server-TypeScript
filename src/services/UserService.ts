import User, { UserAttributes } from "../models/User";
import Invite from "../models/Invite";
import logger from "../utils/Logger";
import { FindOptions } from "sequelize";

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
  // Funções utilitárias para converter promessas em callbacks
  private static findUserInternal(
    options: FindOptions<UserAttributes>,
    callback: (error: Error | null, user: User | null) => void
  ): void {
    User.findOne(options)
      .then((user: User | null) => callback(null, user))
      .catch((error: Error) => callback(error, null));
  }

  private static createUserInternal(
    attributes: UserAttributes,
    callback: (error: Error | null, user?: User) => void
  ): void {
    User.create(attributes)
      .then((user: User) => callback(null, user))
      .catch((error: Error) => callback(error));
  }

  private static saveUserInternal(
    user: User,
    callback: (error: Error | null) => void
  ): void {
    user
      .save()
      .then(() => callback(null))
      .catch((error: Error) => callback(error));
  }

  private static findInviteInternal(
    options: FindOptions<Invite>,
    callback: (error: Error | null, invite: Invite | null) => void
  ): void {
    Invite.findOne(options)
      .then((invite: Invite | null) => callback(null, invite))
      .catch((error: Error) => callback(error, null));
  }

  private static saveInviteInternal(
    invite: Invite,
    callback: (error: Error | null) => void
  ): void {
    invite
      .save()
      .then(() => callback(null))
      .catch((error: Error) => callback(error));
  }

  public static findUserByEmail(
    email: string,
    callback: (error: Error | null, user: User | null) => void
  ): void {
    this.findUserInternal(
      { where: { email } },
      (error, user) => {
        if (error) {
          logger.error(`Error finding user by email ${email}`, { error });
          return callback(error, null);
        }
        callback(null, user);
      }
    );
  }

  public static createUser(
    attributes: UserCreationAttributes,
    callback: (error: Error | null, user?: User) => void
  ): void {
    this.findUserInternal(
      { where: { username: attributes.username } },
      (error, existingUser) => {
        if (error) {
          logger.error(`Error checking username ${attributes.username}`, {
            error,
          });
          return callback(error);
        }
        if (existingUser) {
          return callback(
            new Error(`Username ${attributes.username} already exists`)
          );
        }

        const userAttributes: UserAttributes = {
          username: attributes.username,
          password: attributes.password,
          email: attributes.email || null,
          crystals: attributes.crystals ?? 0,
          experience: attributes.experience ?? 0,
          level: attributes.level ?? 1,
          isActive: attributes.isActive ?? true,
        };

        this.createUserInternal(userAttributes, (createError, user) => {
          if (createError) {
            logger.error(`Error creating user ${attributes.username}`, {
              error: createError,
            });
            return callback(createError);
          }
          callback(null, user);
        });
      }
    );
  }

  public static login(
    username: string,
    password: string,
    inviteCode: string | null,
    callback: (error: Error | null, user?: User) => void
  ): void {
    this.findUserInternal({ where: { username } }, (error, user) => {
      if (error) {
        logger.error(`Error finding user ${username}`, { error });
        return callback(error);
      }
      if (!user) {
        return callback(new Error("Invalid username or password"));
      }
      if (!user.isActive) {
        return callback(new Error("Account is deactivated"));
      }

      user.verifyPassword(password, (verifyError, isMatch) => {
        if (verifyError) {
          logger.error(`Error verifying password for ${username}`, {
            error: verifyError,
          });
          return callback(verifyError);
        }
        if (!isMatch) {
          return callback(new Error("Invalid username or password"));
        }

        // Atualizar lastLogin
        user.lastLogin = new Date();

        // Vincular inviteCode, se fornecido
        if (inviteCode) {
          this.findInviteInternal(
            { where: { code: inviteCode } },
            (inviteError, invite) => {
              if (inviteError) {
                logger.error(`Error finding invite code ${inviteCode}`, {
                  error: inviteError,
                });
                return callback(inviteError);
              }
              if (!invite) {
                return callback(new Error("Invalid invite code"));
              }
              if (invite.userId) {
                return callback(new Error("Invite code already used"));
              }

              invite.userId = user.id;
              invite.player = username;

              this.saveInviteInternal(invite, (saveInviteError) => {
                if (saveInviteError) {
                  logger.error(
                    `Error saving invite ${inviteCode} for ${username}`,
                    {
                      error: saveInviteError,
                    }
                  );
                  return callback(saveInviteError);
                }

                this.saveUserInternal(user, (saveUserError) => {
                  if (saveUserError) {
                    logger.error(
                      `Error updating user ${username} with lastLogin`,
                      {
                        error: saveUserError,
                      }
                    );
                    return callback(saveUserError);
                  }
                  callback(null, user);
                });
              });
            }
          );
        } else {
          this.saveUserInternal(user, (saveError) => {
            if (saveError) {
              logger.error(`Error updating lastLogin for ${username}`, {
                error: saveError,
              });
              return callback(saveError);
            }
            callback(null, user);
          });
        }
      });
    });
  }

  public static updateResources(
    userId: number,
    updates: { crystals?: number; experience?: number; level?: number },
    callback: (error: Error | null, user?: User) => void
  ): void {
    this.findUserInternal({ where: { id: userId } }, (error, user) => {
      if (error) {
        logger.error(`Error finding user ID ${userId}`, { error });
        return callback(error);
      }
      if (!user) {
        return callback(new Error("User not found"));
      }

      if (updates.crystals !== undefined) {
        user.crystals =
          updates.crystals >= 0 ? updates.crystals : user.crystals;
      }
      if (updates.experience !== undefined) {
        user.experience =
          updates.experience >= 0 ? updates.experience : user.experience;
      }
      if (updates.level !== undefined) {
        user.level = updates.level >= 1 ? updates.level : user.level;
      }

      this.saveUserInternal(user, (saveError) => {
        if (saveError) {
          logger.error(`Error updating resources for user ID ${userId}`, {
            error: saveError,
          });
          return callback(saveError);
        }
        callback(null, user);
      });
    });
  }
}
