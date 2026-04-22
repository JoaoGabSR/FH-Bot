import { Global, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const adapter = new PrismaBetterSqlite3({url: process.env.DATABASE_URL || 'file:./dev.db'});
    super({ adapter });
  }

  async onModuleInit() {
    console.log('Connecting to the database...');
    await this.$connect();
  }

  async onModuleDestroy() {
    console.log('Disconnecting from the database...');
    await this.$disconnect();
  }
}
