import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// PrismaClient: schema.prisma から自動生成された、DB と話すための窓口。
// prisma.todo.findMany(...) のように書くと、Prisma が SQL を作って DB に送る。
// Nest の部品（Injectable）にしておくと、service が「PrismaService が欲しい」と宣言するだけで受け取れる。
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect(); // 起動時に DB へ接続する。つながらなければここで起動に失敗する
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
