import { UserDocument } from "@/models/User";
import { UserService, UserCreationAttributes } from "@/shared/services/UserService";
import logger from "@/utils/Logger";
import crypto from "crypto";

export class AuthService {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async createUser(attributes: UserCreationAttributes): Promise<UserDocument> {
        // A lógica de criação de usuário está fortemente ligada à autenticação.
        return this.userService.createUser(attributes);
    }

    public async login(username: string, password: string): Promise<UserDocument> {
        // A lógica de login é o núcleo da autenticação.
        return this.userService.login(username, password, null);
    }

    public async findUserByLoginToken(token: string): Promise<UserDocument | null> {
        return this.userService.findUserByLoginToken(token);
    }

    public async generateAndSetLoginToken(user: UserDocument): Promise<string> {
        return this.userService.generateAndSetLoginToken(user);
    }

    public async updatePasswordByEmail(originalEmail: string, newPass: string, newEmail: string): Promise<UserDocument> {
        return this.userService.updatePasswordByEmail(originalEmail, newPass, newEmail);
    }

    public async linkEmailToAccount(user: UserDocument, newEmail: string): Promise<UserDocument> {
        return this.userService.linkEmailToAccount(user, newEmail);
    }
}