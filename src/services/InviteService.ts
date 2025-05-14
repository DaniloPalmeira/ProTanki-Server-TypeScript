import Invite, { InviteAttributes } from "../models/Invite";
import { IInviteResponse } from "../types/IInviteResponse";
import {
  INVITE_CODE_CHARACTERS,
  INVITE_CODE_LENGTH,
} from "../config/constants";
import logger from "../utils/Logger";
import { FindOptions } from "sequelize";

export class InviteService {
  private static readonly MAX_CODE_GENERATION_ATTEMPTS = 10;

  private static generateInviteCode(): string {
    let code = "";
    for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(
        Math.random() * INVITE_CODE_CHARACTERS.length
      );
      code += INVITE_CODE_CHARACTERS.charAt(randomIndex);
    }
    return code;
  }

  // Funções utilitárias para converter promessas em callbacks
  private static findInvite(
    options: FindOptions<InviteAttributes>,
    callback: (error: Error | null, invite: Invite | null) => void
  ): void {
    Invite.findOne(options)
      .then((invite: Invite | null) => callback(null, invite))
      .catch((error: Error) => callback(error, null));
  }

  private static createInvite(
    attributes: InviteAttributes,
    callback: (error: Error | null, invite?: Invite) => void
  ): void {
    Invite.create(attributes)
      .then((invite: Invite) => callback(null, invite))
      .catch((error: Error) => callback(error));
  }

  private static saveInvite(
    invite: Invite,
    callback: (error: Error | null) => void
  ): void {
    invite
      .save()
      .then(() => callback(null))
      .catch((error: Error) => callback(error));
  }

  public static createInviteCode(
    callback: (error: Error | null, code?: string) => void
  ): void {
    let attempts = 0;

    function tryCreateCode(): void {
      if (attempts >= InviteService.MAX_CODE_GENERATION_ATTEMPTS) {
        const error = new Error(
          "Failed to generate unique invite code after maximum attempts"
        );
        return callback(error);
      }

      const code = InviteService.generateInviteCode();
      InviteService.findInvite({ where: { code } }, (error, existingInvite) => {
        if (error) {
          logger.error(`Error checking invite code ${code}`, { error });
          return callback(error);
        }

        if (existingInvite) {
          attempts++;
          return tryCreateCode();
        }

        InviteService.createInvite(
          { code, player: null },
          (createError, invite) => {
            if (createError) {
              logger.error(`Error creating invite code ${code}`, {
                error: createError,
              });
              return callback(createError);
            }
            callback(null, code);
          }
        );
      });
    }

    tryCreateCode();
  }

  public static linkInviteCodeToNickname(
    code: string,
    nickname: string,
    callback: (error: Error | null, response?: IInviteResponse) => void
  ): void {
    InviteService.findInvite({ where: { code } }, (error, invite) => {
      if (error) {
        logger.error(`Error finding invite code ${code}`, { error });
        return callback(error);
      }

      if (!invite) {
        return callback(null, { isValid: false });
      }
      if (invite.player) {
        return callback(null, { isValid: false });
      }

      invite.player = nickname;
      InviteService.saveInvite(invite, (saveError) => {
        if (saveError) {
          logger.error(
            `Error saving invite code ${code} with nickname ${nickname}`,
            { error: saveError }
          );
          return callback(saveError);
        }
        callback(null, { isValid: true, nickname });
      });
    });
  }

  public static validateInviteCode(
    code: string,
    callback: (error: Error | null, response?: IInviteResponse) => void
  ): void {
    InviteService.findInvite({ where: { code } }, (error, invite) => {
      if (error) {
        logger.error(`Error validating invite code ${code}`, { error });
        return callback(error);
      }
      callback(null, {
        isValid: !!invite,
        nickname: invite?.player || null,
      });
    });
  }
}
