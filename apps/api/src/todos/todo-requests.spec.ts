import { describe, expect, it } from "@jest/globals";
import {
	AddTagRequestSchema,
	CreateTodoRequestSchema,
	UpdateTodoRequestSchema,
} from "@todo/types";
import type { z } from "zod";

// ZodValidationPipe と同じスキーマで検証し、引っかかったプロパティ名の一覧を返す。
// 知らないプロパティは path ではなく keys に入るので、そちらも拾う
function invalidProps(schema: z.ZodType, body: object) {
	const result = schema.safeParse(body);
	if (result.success) return [];
	return result.error.issues.flatMap((issue) =>
		issue.code === "unrecognized_keys" ? issue.keys : [String(issue.path[0])],
	);
}

describe("CreateTodoRequestSchema", () => {
	it("title だけで通る", () => {
		expect(
			invalidProps(CreateTodoRequestSchema, { title: "牛乳を買う" }),
		).toEqual([]);
	});

	it.each([
		["title がない", {}, "title"],
		["title が空", { title: "" }, "title"],
		["title が空白だけ", { title: "   " }, "title"],
		["title が 101 文字", { title: "a".repeat(101) }, "title"],
		["dueDate が日付の形でない", { title: "x", dueDate: "8/31" }, "dueDate"],
		[
			"dueDate に時刻が付いている",
			{ title: "x", dueDate: "2026-08-31T10:00:00Z" },
			"dueDate",
		],
		[
			"dueDate が存在しない日",
			{ title: "x", dueDate: "2026-02-30" },
			"dueDate",
		],
		["status が未知の値", { title: "x", status: "archived" }, "status"],
		["tags に空白だけの名前", { title: "x", tags: ["  "] }, "tags"],
		[
			"tags が 21 個",
			{ title: "x", tags: Array.from({ length: 21 }, (_, i) => `t${i}`) },
			"tags",
		],
		["知らないプロパティ", { title: "x", owner: "jiro" }, "owner"],
	])("%s なら弾く", (_, body, prop) => {
		expect(invalidProps(CreateTodoRequestSchema, body)).toContain(prop);
	});

	it("dueDate: null は「締め切りなし」として通す", () => {
		expect(
			invalidProps(CreateTodoRequestSchema, { title: "x", dueDate: null }),
		).toEqual([]);
	});

	it("title とタグ名の前後の空白を落とす", () => {
		expect(
			CreateTodoRequestSchema.parse({ title: " 牛乳 ", tags: [" 買い物 "] }),
		).toEqual({
			title: "牛乳",
			tags: ["買い物"],
		});
	});
});

describe("UpdateTodoRequestSchema", () => {
	it("空の本体も通る（何も変えない）", () => {
		expect(invalidProps(UpdateTodoRequestSchema, {})).toEqual([]);
	});

	it("tags は PATCH では受け付けない", () => {
		expect(
			invalidProps(UpdateTodoRequestSchema, { tags: ["買い物"] }),
		).toContain("tags");
	});
});

describe("AddTagRequestSchema", () => {
	it.each([[""], ["   "], ["a".repeat(31)]])("name が %j なら弾く", (name) => {
		expect(invalidProps(AddTagRequestSchema, { name })).toContain("name");
	});
});
