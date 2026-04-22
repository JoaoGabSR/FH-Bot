import { PrismaModule } from '../prisma/prisma.module';
import { DiscordService } from './discord.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  providers: [ DiscordService,],
})
export class DiscordModule {}
