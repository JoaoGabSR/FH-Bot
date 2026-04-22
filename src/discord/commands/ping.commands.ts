import { Message } from "discord.js";

export async function handlePingCommand(message: Message) {
    await message.reply('To pronto pra rodar! Bora lá...');
}
