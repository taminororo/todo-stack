import { describe, expect, it } from "@jest/globals";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CreateUserDto } from "./create-user.dto.js";

function invalidProps(body: object) {
  return validateSync(plainToInstance(CreateUserDto, body), { whitelist: true, forbidNonWhitelisted: true }).map(
    (e) => e.property,
  );
}

describe("CreateUserDto", () => {
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
});
