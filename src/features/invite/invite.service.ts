import { INVITE_CODE_CHARACTERS, INVITE_CODE_LENGTH } from "@/config/constants";
import logger from "@/utils/logger";
import Invite from "./invite.model";
import { IInviteResponse } from "./invite.types";

export class InviteService {
    private readonly MAX_CODE_GENERATION_ATTEMPTS = 10;

    private generateInviteCode(): string {
        let code = "";
        for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
            const randomIndex = Math.floor(Math.random() * INVITE_CODE_CHARACTERS.length);
            code += INVITE_CODE_CHARACTERS.charAt(randomIndex);
        }
        return code;
    }

    public async createInviteCode(): Promise<string> {
        for (let attempts = 0; attempts < this.MAX_CODE_GENERATION_ATTEMPTS; attempts++) {
            const code = this.generateInviteCode();
            try {
                const existingInvite = await Invite.findOne({ code });
                if (!existingInvite) {
                    const invite = await Invite.create({ code, player: null });
                    return invite.code;
                }
            } catch (error) {
                logger.error(`Error during invite code creation for code ${code}`, { error });
                throw error;
            }
        }
        throw new Error("Failed to generate unique invite code after maximum attempts");
    }

    public async validateInviteCode(code: string): Promise<IInviteResponse> {
        try {
            const invite = await Invite.findOne({ code });
            return {
                isValid: !!invite,
                nickname: invite?.player || null,
            };
        } catch (error) {
            logger.error(`Error validating invite code ${code}`, { error });
            throw error;
        }
    }
}