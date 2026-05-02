import { DiscordModule } from './discord/discord.module';
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskScheduleModule } from './taskschedule/taskschedule.module';

@Module({
    imports: [ 
        DiscordModule,
        PrismaModule,
        ConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        ScheduleModule,
        TaskScheduleModule,
    ],
})
export class AppModule {}
