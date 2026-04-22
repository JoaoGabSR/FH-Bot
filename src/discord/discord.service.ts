import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits } from 'discord.js';
import { handlePingCommand } from './commands/ping.commands';
import { handleConvoyCommand } from './commands/convey.commands';
import { PrismaService } from '../prisma/prisma.service';
import { convoyCancelInteractionHandler, convoyConfirmInteractionHandler, convoyParticipantListHandler } from './interactions/convoy-list.interactions';

@Injectable()
export class DiscordService implements OnModuleInit{  
  private readonly client: Client;

  constructor(
    private readonly prisma: PrismaService,
  ) {
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
    this.client.once('ready', async () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);      
    });
    

    this.client.on('messageCreate', async (message) => {
      const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID || '');

      // Ignore messages from bot
      if (message.author.bot) return; 

      /* 
        /rodar
        Command to test bot connection
      */
      if (message.content.startsWith('/rodar')) await handlePingCommand(message);

      /*
        /comboio
        Command to start the convoy
      */
      if (message.content.startsWith('/comboio')) await handleConvoyCommand(message, this.prisma, channel);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton()) return;

      // Handle button interactions for convoy confirmation
      if(interaction.customId.startsWith('convoy_confirm_')) await convoyConfirmInteractionHandler(this.prisma, interaction);

      // Handle button interactions for convoy decline
      if(interaction.customId.startsWith('convoy_decline_')) await convoyCancelInteractionHandler(this.prisma, interaction);

      // handle button interactions for convoy list
      if(interaction.customId.startsWith('convoy_list_')) await convoyParticipantListHandler(this.prisma, interaction);
    });

    await this.client.login(process.env.DISCORD_TOKEN);
  }
}
