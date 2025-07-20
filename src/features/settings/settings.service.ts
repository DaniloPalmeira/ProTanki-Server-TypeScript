import { UserDocument } from "@/models/User";
import { UserService } from "@/shared/services/UserService";
import logger from "@/utils/Logger";

export class SettingsService {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async updatePasswordByEmail(originalEmail: string, newPass: string, newEmail: string): Promise<UserDocument> {
        const user = await this.userService.findUserByEmail(originalEmail);
        if (!user) {
            throw new Error(`User with email ${originalEmail} not found.`);
        }

        if (newEmail.toLowerCase() !== (user.email || "").toLowerCase()) {
            const isNewEmailTaken = await this.userService.isEmailInUse(newEmail, user.id);
            if (isNewEmailTaken) {
                throw new Error(`Email ${newEmail} is already in use.`);
            }
            user.email = newEmail;
            user.emailConfirmed = false;
        }

        user.password = newPass;

        return await user.save();
    }

    public async linkEmailToAccount(user: UserDocument, newEmail: string): Promise<UserDocument> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            throw new Error("Formato de e-mail inválido.");
        }

        if (user.email && user.emailConfirmed) {
            throw new Error("Um e-mail verificado já está vinculado a esta conta.");
        }

        const isTaken = await this.userService.isEmailInUse(newEmail, user.id);
        if (isTaken) {
            throw new Error("EMAIL_IN_USE");
        }

        user.email = newEmail;
        user.emailConfirmed = false;

        await user.save();
        logger.info(`User ${user.username} linked new email ${newEmail}.`);
        return user;
    }

    public async setNotifications(user: UserDocument, enabled: boolean): Promise<UserDocument> {
        try {
            user.notificationsEnabled = enabled;
            await user.save();
            logger.info(`User ${user.username} updated notifications to: ${enabled}.`);
            return user;
        } catch (error) {
            logger.error(`Failed to save notification settings for user ${user.username}`, { error });
            throw error;
        }
    }
}