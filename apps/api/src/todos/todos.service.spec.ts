import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service.js";
import { TodosService } from "./todos.service.js";

// DB にはつながず、TodosService が使う Prisma のメソッドだけを差し替える
function createPrismaMock() {
	return {
		user: { findUnique: jest.fn<(...args: any[]) => Promise<any>>() },
		todo: {
			findMany: jest.fn<(...args: any[]) => Promise<any>>(),
			findFirst: jest.fn<(...args: any[]) => Promise<any>>(),
			create: jest.fn<(...args: any[]) => Promise<any>>(),
			update: jest.fn<(...args: any[]) => Promise<any>>(),
			delete: jest.fn<(...args: any[]) => Promise<any>>(),
		},
		tag: {
			findMany: jest.fn<(...args: any[]) => Promise<any>>(),
			upsert: jest.fn<(...args: any[]) => Promise<any>>(),
		},
		todoTag: { deleteMany: jest.fn<(...args: any[]) => Promise<any>>() },
	};
}

const taro = { id: 1, name: "taro" };

// todoInclude 付きで読んだときの行の形
function todoRow(overrides: Record<string, unknown> = {}) {
	return {
		id: 10,
		title: "牛乳を買う",
		dueDate: new Date("2026-08-31"),
		status: "todo",
		ownerId: taro.id,
		owner: taro,
		todoTags: [
			{
				todoId: 10,
				tagId: 3,
				tag: { id: 3, name: "買い物", ownerId: taro.id },
			},
		],
		...overrides,
	};
}

describe("TodosService", () => {
	let prisma: ReturnType<typeof createPrismaMock>;
	let service: TodosService;

	beforeEach(() => {
		prisma = createPrismaMock();
		service = new TodosService(prisma as unknown as PrismaService);
		prisma.user.findUnique.mockResolvedValue(taro);
	});

	describe("findAll", () => {
		it("DB の行を API の Todo の形に変えて返す", async () => {
			prisma.todo.findMany.mockResolvedValue([
				todoRow(),
				todoRow({ id: 11, dueDate: null, todoTags: [] }),
			]);

			await expect(service.findAll("taro")).resolves.toEqual([
				{
					id: 10,
					title: "牛乳を買う",
					dueDate: "2026-08-31",
					status: "todo",
					tags: [{ id: 3, name: "買い物" }],
					owner: "taro",
				},
				{
					id: 11,
					title: "牛乳を買う",
					dueDate: null,
					status: "todo",
					tags: [],
					owner: "taro",
				},
			]);
			expect(prisma.todo.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { ownerId: taro.id },
					orderBy: { id: "asc" },
				}),
			);
		});

		it("ユーザーがいなければ NotFoundException", async () => {
			prisma.user.findUnique.mockResolvedValue(null);

			await expect(service.findAll("nobody")).rejects.toThrow(
				NotFoundException,
			);
			expect(prisma.todo.findMany).not.toHaveBeenCalled();
		});
	});

	describe("create", () => {
		it("タグ名の前後の空白を落とし、重複をまとめてから作る", async () => {
			prisma.todo.create.mockResolvedValue(todoRow());

			await service.create("taro", {
				title: "牛乳を買う",
				tags: [" 買い物", "買い物 ", "食品"],
			});

			const { data } = prisma.todo.create.mock.calls[0][0];
			const names = data.todoTags.create.map(
				(t: any) => t.tag.connectOrCreate.create.name,
			);
			expect(names).toEqual(["買い物", "食品"]);
		});

		it("dueDate を Date に変え、省略された項目は undefined のまま渡す", async () => {
			prisma.todo.create.mockResolvedValue(todoRow());

			await service.create("taro", {
				title: "牛乳を買う",
				dueDate: "2026-08-31",
			});

			const { data } = prisma.todo.create.mock.calls[0][0];
			expect(data.dueDate).toEqual(new Date("2026-08-31T00:00:00Z"));
			expect(data.status).toBeUndefined(); // DB の既定値 "todo" に任せる
			expect(data.todoTags.create).toEqual([]);
		});
	});

	describe("update", () => {
		it("dueDate: null は締め切りを消し、送っていない項目は触らない", async () => {
			prisma.todo.findFirst.mockResolvedValue(todoRow());
			prisma.todo.update.mockResolvedValue(todoRow({ dueDate: null }));

			const todo = await service.update("taro", 10, { dueDate: null });

			expect(prisma.todo.update.mock.calls[0][0].data).toEqual({
				title: undefined,
				dueDate: null,
				status: undefined,
			});
			expect(todo.dueDate).toBeNull();
		});
	});

	describe("remove", () => {
		it("自分の Todo なら消す", async () => {
			prisma.todo.findFirst.mockResolvedValue(todoRow());

			await service.remove("taro", 10);

			expect(prisma.todo.delete).toHaveBeenCalledWith({ where: { id: 10 } });
		});

		it("ほかのユーザーの Todo は 404 にして消さない", async () => {
			prisma.todo.findFirst.mockResolvedValue(null);
			await expect(service.remove("taro", 99)).rejects.toThrow(
				NotFoundException,
			);
			expect(prisma.todo.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: expect.objectContaining({ id: 99, ownerId: taro.id }),
				}),
			);
			expect(prisma.todo.delete).not.toHaveBeenCalled();
		});
	});

	describe("addTag", () => {
		it("タグを upsert してから Todo に付ける", async () => {
			prisma.todo.findFirst.mockResolvedValue(todoRow());
			prisma.tag.upsert.mockResolvedValue({
				id: 5,
				name: "急ぎ",
				ownerId: taro.id,
			});
			prisma.todo.update.mockResolvedValue(todoRow());

			await service.addTag("taro", 10, "  急ぎ ");

			expect(prisma.tag.upsert).toHaveBeenCalledWith({
				where: { ownerId_name: { ownerId: taro.id, name: "急ぎ" } },
				update: {},
				create: { name: "急ぎ", ownerId: taro.id },
			});
			expect(
				prisma.todo.update.mock.calls[0][0].data.todoTags.upsert.create,
			).toEqual({ tagId: 5 });
		});
	});

	describe("removeTag", () => {
		it("その Todo との関連だけを消す", async () => {
			prisma.todo.findFirst.mockResolvedValue(todoRow());

			await service.removeTag("taro", 10, 3);

			expect(prisma.todoTag.deleteMany).toHaveBeenCalledWith({
				where: { todoId: 10, tagId: 3 },
			});
		});
	});

	describe("findTags", () => {
		it("そのユーザーのタグを名前順で返す", async () => {
			prisma.tag.findMany.mockResolvedValue([{ id: 3, name: "買い物" }]);

			await expect(service.findTags("taro")).resolves.toEqual([
				{ id: 3, name: "買い物" },
			]);
			expect(prisma.tag.findMany).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { ownerId: taro.id },
					orderBy: { name: "asc" },
				}),
			);
		});
	});
});
