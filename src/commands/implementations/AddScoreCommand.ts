import { ChatModeratorLevel } from "../../models/enums/ChatModeratorLevel";
import UpdateRankPacket from "../../packets/implementations/UpdateRankPacket";
import UpdateScorePacket from "../../packets/implementations/UpdateScorePacket";
import { CommandContext, ICommand } from "../ICommand";

export default class AddScoreCommand implements ICommand {
  name: string = "addscore";
  description: string = "Adiciona ou remove pontos de experiência da conta do usuário.";
  permissionLevel: ChatModeratorLevel = ChatModeratorLevel.ADMINISTRATOR;

  async execute(context: CommandContext, args: string[]): Promise<void> {
    if (args.length < 1) {
      context.reply("Uso: /addscore <quantidade>");
      return;
    }

    const amount = parseInt(args[0], 10);

    if (isNaN(amount)) {
      context.reply("Erro: A quantidade deve ser um número.");
      return;
    }

    const user = context.executor.user;
    if (!user) {
      context.reply("Erro: Usuário não encontrado.");
      return;
    }

    const originalRank = user.rank;
    const currentScore = user.experience;
    let newScore = currentScore + amount;

    const MIN_SCORE = 0;
    const MAX_SCORE = 2147483647;
    newScore = Math.max(MIN_SCORE, Math.min(newScore, MAX_SCORE));

    try {
      const updatedUser = await context.server.userService.updateResources(user.id, {
        experience: newScore,
      });

      context.executor.user = updatedUser;

      context.executor.sendPacket(new UpdateScorePacket(updatedUser.experience));
      context.reply(`Pontuação atualizada para: ${updatedUser.experience}.`);

      if (updatedUser.rank !== originalRank) {
        const newRankInfo = context.server.rankService.getRankById(updatedUser.rank);
        if (newRankInfo) {
          const rankPacket = new UpdateRankPacket({
            rank: updatedUser.rank,
            score: updatedUser.experience,
            currentRankScore: newRankInfo.minScore,
            nextRankScore: updatedUser.nextRankScore,
            reward: 0,
          });
          context.executor.sendPacket(rankPacket);
          context.reply(`Parabéns! Você alcançou o rank: ${newRankInfo.name}.`);
        }
      }
    } catch (error: any) {
      context.reply(`Erro ao atualizar a pontuação: ${error.message}`);
    }
  }
}
