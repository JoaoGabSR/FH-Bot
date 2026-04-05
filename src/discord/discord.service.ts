import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordService implements OnModuleInit{
  private readonly client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
      ]
    })
  }

  async onModuleInit() {
    this.client.once('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return; // Ignore messages from bots

      if (message.content.toLowerCase() === '/ping') {
        await message.reply('Pong!');
      }
    })

    await this.client.login(process.env.DISCORD_TOKEN);
  }
}
