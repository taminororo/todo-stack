import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { ConflictException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service.js";
import { UsersService } from "./users.service.js";

function createPrismaMock() {
  return {
    user: {
      findMany: jest.fn<(...args: any[]) => Promise<any>>(),
      create: jest.fn<(...args: any[]) => Promise<any>>(),
    },
  };
}

// Prisma が一意制約の違反で投げるエラー
const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed on the fields: (`name`)", {
    code: "P2002",
    clientVersion: "test",
  });

describe("UsersService", () => {
  let prisma: ReturnType<typeof createPrismaMock>;
  let service: UsersService;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new UsersService(prisma as unknown as PrismaService);
  });

  describe("create", () => {
    it("作ったユーザーを返す", async () => {
      prisma.user.create.mockResolvedValue({ id: 2, name: "hanako" });

      await expect(service.create("hanako")).resolves.toEqual({ id: 2, name: "hanako" });
    });

    it("同じ名前がもういれば ConflictException", async () => {
      prisma.user.create.mockRejectedValue(uniqueViolation());

      await expect(service.create("taro")).rejects.toThrow(ConflictException);
    });

    it("それ以外のエラーはそのまま投げる", async () => {
      const error = new Error("connection lost");
      prisma.user.create.mockRejectedValue(error);

      await expect(service.create("taro")).rejects.toBe(error);
    });
  });
});
