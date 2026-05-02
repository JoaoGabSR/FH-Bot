import { Module } from '@nestjs/common';
import { TaskScheduleService } from './taskschedule.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  exports: [TaskScheduleService],
  providers: [TaskScheduleService]
})
export class TaskScheduleModule {}
