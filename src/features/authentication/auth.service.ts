import { UserDocument } from "@/shared/models/user.model";
import { UserCreationAttributes, UserService } from "@/shared/services/UserService";

export class AuthService {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async createUser(attributes: UserCreationAttributes): Promise<UserDocument> {
        return this.userService.createUser(attributes);
    }

    public async login(username: string, password: string): Promise<UserDocument> {
        return this.userService.login(username, password, null);
    }

    public async findUserByLoginToken(token: string): Promise<UserDocument | null> {
        return this.userService.findUserByLoginToken(token);
    }

    public async generateAndSetLoginToken(user: UserDocument): Promise<string> {
        return this.userService.generateAndSetLoginToken(user);
    }
}