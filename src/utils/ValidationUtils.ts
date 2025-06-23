const inappropriateWords = [
    "admin", "adm", "moderator", "mod", "support",
    "fuck", "shit", "bitch", "cunt", "asshole"
];

export class ValidationUtils {
    public static isNicknameInappropriate(nickname: string): boolean {
        const lowerCaseNickname = nickname.toLowerCase();
        return inappropriateWords.some(word => lowerCaseNickname.includes(word));
    }
}