import { describe, expect, it } from "@jest/globals";
import { CreateUserRequestSchema } from "@todo/types";

function invalidProps(body: object) {
  const result = CreateUserRequestSchema.safeParse(body);
  return result.success ? [] : result.error.issues.map((issue) => String(issue.path[0]));
}

describe("CreateUserRequestSchema", () => {
  it.each([["taro"], ["花子"], ["jiro_2-b"]])("name が %j なら通る", (name) => {
    expect(invalidProps({ name })).toEqual([]);
  });

  it.each([
    ["name がない", {}],
    ["name が空", { name: "" }],
    ["空白を含む", { name: "taro yamada" }],
    ["スラッシュを含む", { name: "a/b" }],
    ["31 文字", { name: "a".repeat(31) }],
    ["Web の /api と重なる", { name: "api" }],
  ])("%s なら弾く", (_, body) => {
    expect(invalidProps(body)).toContain("name");
  });

  it("前後の空白を落としてから確かめる", () => {
    expect(CreateUserRequestSchema.parse({ name: " hanako " })).toEqual({ name: "hanako" });
  });
});
