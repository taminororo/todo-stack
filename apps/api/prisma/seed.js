import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const taro = await prisma.user.upsert({
  where: { name: "taro" },
  update: {},
  create: { name: "taro" },
});

if ((await prisma.todo.count({ where: { ownerId: taro.id } })) === 0) {
  await prisma.todo.create({
    data: {
      title: "牛乳を買う",
      dueDate: new Date("2026-08-31"),
      status: "todo",
      ownerId: taro.id,
      todoTags: {
        create: ["買い物", "食品"].map((name) => ({
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
