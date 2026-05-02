import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';
import { Convoy } from '@prisma/client';


@Injectable()
export class TaskScheduleService {
    private readonly logger: Logger = new Logger(TaskScheduleService.name);

    constructor(
        private readonly prisma: PrismaService,
    ) {}

    @Cron('0 0 23 * * *')
    async dailyClosePassedConvey(): Promise<void> {
        this.logger.log('Running daily task at 23:00');

        const convoyListOpened = await this.prisma.convoy.findMany({
            where: {
                status: 'OPEN'
            }
        });

        const convoyListClosed: Convoy[] = [];

        convoyListOpened.forEach(async (convoy) => {
            if(convoy.eventDate < new Date() || convoy.eventDate == new Date()) {
                await this.prisma.convoy.update({
                    where: {
                        id: convoy.id
                    },
                    data: {
                        status: 'CLOSED'
                    }
                });

                convoyListClosed.push(convoy);
            }
        });

        if(convoyListClosed.length > 0) {
            this.logger.log(`Finished daily task at 23:00: Closed ${convoyListClosed.length} convoys`);
            this.logger.log(`Closed convoys: ${convoyListClosed.map(c => c.id).join(', ')}`);
        } else {
            this.logger.log('Finished daily task at 23:00: No convoys to close');
        }
    }
}