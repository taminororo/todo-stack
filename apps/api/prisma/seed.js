// 開発用の初期データ。`pnpm exec prisma db seed` で実行する。何度実行しても同じ結果になる。
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ユーザー taro がいなければ作る（upsert = あれば何もせず、なければ作る）
const taro = await prisma.user.upsert({
  where: { name: "taro" },
  update: {},
  create: { name: "taro" },
});

// 動作確認用のサンプル Todo。taro の Todo が 1 件もないときだけ入れる。
if ((await prisma.todo.count({ where: { ownerId: taro.id } })) === 0) {
  await prisma.todo.create({
    data: {
      title: "牛乳を買う",
      dueDate: new Date("2026-08-31"),
      status: "todo",
      ownerId: taro.id,
      todoTags: {
        create: ["買い物", "食品"].map((name) => ({
          // そのユーザーに同名のタグがあれば使い、なければ作る
          tag: {
            connectOrCreate: {
              where: { ownerId_name: { ownerId: taro.id, name } },
              create: { name, ownerId: taro.id },
            },
          },
        })),
      },
    },
  });
}

await prisma.$disconnect();
