import { DiscordService } from './discord.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [ DiscordService,],
  exports: []
})
export class DiscordModule {}
