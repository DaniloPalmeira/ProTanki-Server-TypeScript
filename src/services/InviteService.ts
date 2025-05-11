import Invite from "../models/Invite";
import { IInviteResponse } from "../types/IInviteResponse";
import { INVITE_CODE_CHARACTERS, INVITE_CODE_LENGTH } from "../config/constants";

export class InviteService {
  private static readonly MAX_CODE_GENERATION_ATTEMPTS = 10;

  private static generateInviteCode(): string {
    let code = "";
    for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * INVITE_CODE_CHARACTERS.length);
      code += INVITE_CODE_CHARACTERS.charAt(randomIndex);
    }
    return code;
  }

  public static async createInviteCode(): Promise<string> {
    let attempts = 0;
    while (attempts < this.MAX_CODE_GENERATION_ATTEMPTS) {
      const code = this.generateInviteCode();
      const existingInvite = await Invite.findOne({ where: { code } });

      if (!existingInvite) {
        await Invite.create({ code, player: null });
        return code;
      }
      attempts++;
    }
    throw new Error("Failed to generate unique invite code after maximum attempts");
  }

  public static async linkInviteCodeToNickname(code: string, nickname: string): Promise<IInviteResponse> {
    try {
      const invite = await Invite.findOne({ where: { code } });
      if (!invite) {
        return { isValid: false };
      }
      if (invite.player) {
        return { isValid: false };
      }
      invite.player = nickname;
      await invite.save();
      return { isValid: true, nickname };
    } catch (error) {
      console.error(`Error linking invite code ${code} to nickname ${nickname}:`, error);
      return { isValid: false };
    }
  }

  public static async validateInviteCode(code: string): Promise<IInviteResponse> {
    try {
      const invite = await Invite.findOne({ where: { code } });
      return {
        isValid: !!invite,
        nickname: invite?.player || null,
      };
    } catch (error) {
      console.error(`Error validating invite code ${code}:`, error);
      return { isValid: false };
    }
  }
}