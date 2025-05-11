import Invite from "../models/Invite"; // Ajuste o caminho
import { IInviteResponse } from "../types/IInviteResponse";

export class InviteService {
  // Gera um código de 5 caracteres (0-9, a-f)
  private static generateInviteCode(): string {
    const characters = "0123456789abcdef";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  // Cria um novo código de convite
  static async createInviteCode(): Promise<string> {
    let code: string;
    let existingInvite: Invite | null;

    // Garante que o código é único
    do {
      code = this.generateInviteCode();
      existingInvite = await Invite.findOne({ where: { code } });
    } while (existingInvite);

    // Cria o convite sem player associado inicialmente
    await Invite.create({ code, player: null });

    return code;
  }

  // Vincula um código de convite a um nickname
  static async linkInviteCodeToNickname(
    code: string,
    nickname: string
  ): Promise<IInviteResponse> {
    const invite = await Invite.findOne({ where: { code } });

    if (!invite) {
      return { isValid: false };
    }

    // Verifica se o código já está vinculado
    if (invite.player) {
      return {
        isValid: false,
      };
    }

    // Atualiza o campo player
    invite.player = nickname;
    await invite.save();

    return {
      isValid: true,
      nickname,
    };
  }

  static async validateInviteCode(code: string): Promise<IInviteResponse> {
    try {
      const invite = await Invite.findOne({ where: { code } });
      return {
        isValid: !!invite,
        nickname: invite ? invite.player : null,
      };
    } catch (error) {
      return { isValid: false };
    }
  }
}
