import { UpdateCrystals } from "@/features/profile/profile.packets";
import { ChatModeratorLevel } from "@/models/enums/ChatModeratorLevel";
import { CommandContext, ICommand } from "../command.types";

export default class AddCrystalsCommand implements ICommand {
    name: string = "addcry";
    description: string = "Adiciona ou remove cristais da conta do usuário.";
    permissionLevel: ChatModeratorLevel = ChatModeratorLevel.NONE;

    async execute(context: CommandContext, args: string[]): Promise<void> {
        if (args.length < 1) {
            context.reply("Uso: /addcry <quantidade>");
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

        const currentCrystals = user.crystals;
        let newCrystals = currentCrystals + amount;

        const MAX_CRYSTALS = 99_999_999;
        const MIN_CRYSTALS = 0;
        newCrystals = Math.max(MIN_CRYSTALS, Math.min(newCrystals, MAX_CRYSTALS));

        try {
            const updatedUser = await context.server.userService.updateResources(user.id, {
                crystals: newCrystals,
            });

            context.executor.user = updatedUser;

            context.executor.sendPacket(new UpdateCrystals(updatedUser.crystals));
            context.reply(`Cristais atualizados para: ${updatedUser.crystals}.`);
        } catch (error: any) {
            context.reply(`Erro ao atualizar os cristais: ${error.message}`);
        }
    }
}