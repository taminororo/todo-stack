import { describe, expect, it } from "@jest/globals";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { AddTagDto } from "./add-tag.dto.js";
import { CreateTodoDto } from "./create-todo.dto.js";
import { UpdateTodoDto } from "./update-todo.dto.js";

// ValidationPipe と同じく、プレーンなオブジェクトを DTO に変えてから検証する。
// 引っかかったプロパティ名の一覧を返す
function invalidProps<T extends object>(cls: new () => T, body: object) {
  return validateSync(plainToInstance(cls, body), { whitelist: true, forbidNonWhitelisted: true }).map(
    (e) => e.property,
  );
}

describe("CreateTodoDto", () => {
  it("title だけで通る", () => {
    expect(invalidProps(CreateTodoDto, { title: "牛乳を買う" })).toEqual([]);
  });

  it.each([
    ["title がない", {}, "title"],
    ["title が空", { title: "" }, "title"],
    ["title が 101 文字", { title: "a".repeat(101) }, "title"],
    ["dueDate が日付の形でない", { title: "x", dueDate: "8/31" }, "dueDate"],
    ["dueDate に時刻が付いている", { title: "x", dueDate: "2026-08-31T10:00:00Z" }, "dueDate"],
    ["status が未知の値", { title: "x", status: "archived" }, "status"],
    ["tags に空白だけの名前", { title: "x", tags: ["  "] }, "tags"],
    ["tags が 21 個", { title: "x", tags: Array.from({ length: 21 }, (_, i) => `t${i}`) }, "tags"],
    ["知らないプロパティ", { title: "x", owner: "jiro" }, "owner"],
  ])("%s なら弾く", (_, body, prop) => {
    expect(invalidProps(CreateTodoDto, body)).toContain(prop);
  });

  it("dueDate: null は「締め切りなし」として通す", () => {
    expect(invalidProps(CreateTodoDto, { title: "x", dueDate: null })).toEqual([]);
  });
});

describe("UpdateTodoDto", () => {
  it("空の本体も通る（何も変えない）", () => {
    expect(invalidProps(UpdateTodoDto, {})).toEqual([]);
  });

  it("tags は PATCH では受け付けない", () => {
    expect(invalidProps(UpdateTodoDto, { tags: ["買い物"] })).toContain("tags");
  });
});

describe("AddTagDto", () => {
  it.each([[""], ["   "], ["a".repeat(31)]])("name が %j なら弾く", (name) => {
    expect(invalidProps(AddTagDto, { name })).toContain("name");
  });
});
