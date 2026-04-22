import { Message } from "discord.js";

export async function handlePingCommand(message: Message) {
    await message.reply('Opaa, **Corredor FH** aqui, pronto para acelerar! 🚗💨');
}
