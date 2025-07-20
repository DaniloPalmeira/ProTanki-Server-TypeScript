import { LobbyWorkflow } from "@/features/lobby/lobby.workflow";
import SystemMessage from "@/packets/implementations/SystemMessage";
import { ProTankiClient } from "@/server/ProTankiClient";
import { ProTankiServer } from "@/server/ProTankiServer";
import { IPacketHandler } from "@/shared/interfaces/IPacketHandler";
import generateCaptcha from "@/utils/GenerateCaptcha";
import logger from "@/utils/Logger";
import { ValidationUtils } from "@/utils/ValidationUtils";
import { LoginWorkflow } from "@/workflows/LoginWorkflow";
import crypto from "crypto";
import * as AuthPackets from "./auth.packets";

export class CreateAccountHandler implements IPacketHandler<AuthPackets.CreateAccount> {
    public readonly packetId = AuthPackets.CreateAccount.getId();
    public async execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.CreateAccount): Promise<void> {
        if (!packet.nickname || !packet.password || packet.nickname.length < 3 || packet.password.length < 3) {
            client.sendPacket(new SystemMessage("Apelido ou senha inválidos."));
            return;
        }
        if (ValidationUtils.isNicknameInappropriate(packet.nickname)) {
            client.sendPacket(new AuthPackets.InvalidNickname());
            return;
        }
        try {
            const user = await server.authService.createUser({
                username: packet.nickname,
                password: packet.password,
            });
            client.user = user;
            logger.info(`Account created and auto-logged in for ${packet.nickname}`, { client: client.getRemoteAddress() });
            const flowHandled = await LobbyWorkflow.postAuthenticationFlow(client, server);
            if (flowHandled && packet.rememberMe) {
                const token = await server.authService.generateAndSetLoginToken(user);
                client.sendPacket(new AuthPackets.LoginTokenPacket(token));
            }
        } catch (error: any) {
            logger.warn(`Failed to create account for ${packet.nickname}`, { error: error.message, client: client.getRemoteAddress() });
            if (error.message.includes("already exists")) {
                const suggestions = await server.userService.generateUsernameSuggestions(packet.nickname);
                client.sendPacket(new AuthPackets.NicknameUnavailable(suggestions));
            } else {
                client.sendPacket(new SystemMessage("Ocorreu um erro ao criar a conta.\nTente novamente."));
            }
        }
    }
}

export class LoginHandler implements IPacketHandler<AuthPackets.Login> {
    public readonly packetId = AuthPackets.Login.getId();
    public async execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.Login): Promise<void> {
        if (!packet.username || !packet.password) {
            client.sendPacket(new AuthPackets.IncorrectPassword());
            return;
        }
        try {
            const user = await server.authService.login(packet.username, packet.password);
            client.user = user;
            logger.info(`Successful login for user ${user.username}`, { client: client.getRemoteAddress() });
            const flowHandled = await LobbyWorkflow.postAuthenticationFlow(client, server);
            if (flowHandled && packet.rememberMe) {
                const token = await server.authService.generateAndSetLoginToken(user);
                client.sendPacket(new AuthPackets.LoginTokenPacket(token));
            }
        } catch (error: any) {
            logger.warn(`Failed login attempt for username ${packet.username}`, { error: error.message, client: client.getRemoteAddress() });
            client.sendPacket(new AuthPackets.IncorrectPassword());
        }
    }
}

export class LoginByTokenHandler implements IPacketHandler<AuthPackets.LoginByTokenRequestPacket> {
    public readonly packetId = AuthPackets.LoginByTokenRequestPacket.getId();
    public async execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.LoginByTokenRequestPacket): Promise<void> {
        if (!packet.hash) {
            client.sendPacket(new SystemMessage("Token de login inválido."));
            return;
        }
        try {
            const user = await server.authService.findUserByLoginToken(packet.hash);
            if (!user) {
                throw new Error("Token de login inválido ou expirado.");
            }
            client.user = user;
            logger.info(`Successful login via token for user ${user.username}`, { client: client.getRemoteAddress() });
            await LobbyWorkflow.postAuthenticationFlow(client, server);
        } catch (error: any) {
            logger.warn(`Failed login attempt via token`, { error: error.message, client: client.getRemoteAddress() });
            client.sendPacket(new SystemMessage(error.message));
        }
    }
}

export class CheckNicknameAvailableHandler implements IPacketHandler<AuthPackets.CheckNicknameAvailable> {
    public readonly packetId = AuthPackets.CheckNicknameAvailable.getId();
    public async execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.CheckNicknameAvailable): Promise<void> {
        if (!packet.nickname || packet.nickname.length < 3) return;
        if (ValidationUtils.isNicknameInappropriate(packet.nickname)) {
            client.sendPacket(new AuthPackets.InvalidNickname());
            return;
        }
        const isAvailable = await server.userService.isUsernameAvailable(packet.nickname);
        if (isAvailable) {
            client.sendPacket(new AuthPackets.NicknameAvailable());
        } else {
            const suggestions = await server.userService.generateUsernameSuggestions(packet.nickname);
            client.sendPacket(new AuthPackets.NicknameUnavailable(suggestions));
        }
    }
}

export class RequestCaptchaHandler implements IPacketHandler<AuthPackets.RequestCaptcha> {
    public readonly packetId = AuthPackets.RequestCaptcha.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.RequestCaptcha): void {
        const captcha = generateCaptcha();
        client.captchaSolution = captcha.text;
        client.sendPacket(new AuthPackets.Captcha(packet.view, captcha.image));
    }
}

export class CaptchaVerifyHandler implements IPacketHandler<AuthPackets.CaptchaVerify> {
    public readonly packetId = AuthPackets.CaptchaVerify.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.CaptchaVerify): void {
        if (packet.solution && client.captchaSolution === packet.solution.toLowerCase()) {
            client.sendPacket(new AuthPackets.CaptchaIsValid(packet.view));
            return;
        }
        const captcha = generateCaptcha();
        client.captchaSolution = captcha.text;
        client.sendPacket(new AuthPackets.CaptchaIsInvalid(packet.view, captcha.image));
    }
}

export class RecoveryAccountSendCodeHandler implements IPacketHandler<AuthPackets.RecoveryAccountSendCode> {
    public readonly packetId = AuthPackets.RecoveryAccountSendCode.getId();
    public async execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.RecoveryAccountSendCode): Promise<void> {
        if (!packet.email) {
            client.sendPacket(new AuthPackets.RecoveryEmailNotExists());
            return;
        }
        logger.info(`Recovery code requested for email: ${packet.email}`, { client: client.getRemoteAddress() });
        try {
            const user = await server.userService.findUserByEmail(packet.email);
            if (user) {
                const recoveryCode = crypto.randomBytes(16).toString("hex");
                logger.info(`Recovery email sent to: ${packet.email}, code: ${recoveryCode}`);
                client.recoveryEmail = packet.email;
                client.recoveryCode = recoveryCode;
                client.sendPacket(new AuthPackets.RecoveryEmailSent());
            } else {
                logger.info(`Email not found: ${packet.email}`);
                client.sendPacket(new AuthPackets.RecoveryEmailNotExists());
            }
        } catch (error) {
            logger.error(`Error checking email ${packet.email}`, { error });
            client.sendPacket(new AuthPackets.RecoveryEmailNotExists());
        }
    }
}

export class RecoveryAccountVerifyCodeHandler implements IPacketHandler<AuthPackets.RecoveryAccountVerifyCode> {
    public readonly packetId = AuthPackets.RecoveryAccountVerifyCode.getId();
    public execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.RecoveryAccountVerifyCode): void {
        if (client.recoveryCode && client.recoveryCode === packet.code) {
            client.sendPacket(new AuthPackets.GoToRecoveryPassword(client.recoveryEmail));
        } else {
            LoginWorkflow.handleInvalidRecoveryCode(client);
        }
    }
}

export class LanguageHandler implements IPacketHandler<AuthPackets.Language> {
    public readonly packetId = AuthPackets.Language.getId();

    public async execute(client: ProTankiClient, server: ProTankiServer, packet: AuthPackets.Language): Promise<void> {
        client.language = packet.lang;
        logger.info(`Setting language to: ${packet.lang}`, {
            client: client.getRemoteAddress(),
        });

        await LoginWorkflow.sendLoginScreenData(client, server);
    }
}