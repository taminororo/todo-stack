import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // 起動時に DB へ接続する。つながらなければここで起動に失敗する
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
