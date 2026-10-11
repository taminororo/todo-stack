import { describe, expect, it } from "@jest/globals";
import { BadRequestException } from "@nestjs/common";
import { CreateTodoRequestSchema } from "@todo/types";
import { ZodValidationPipe } from "./zod-validation.pipe.js";

const pipe = new ZodValidationPipe(CreateTodoRequestSchema);

// 投げた BadRequestException の本体を取り出す
function badRequestBody(value: unknown) {
  try {
    pipe.transform(value);
  } catch (e) {
    expect(e).toBeInstanceOf(BadRequestException);
    return (e as BadRequestException).getResponse();
  }
  throw new Error("BadRequestException が投げられなかった");
}

describe("ZodValidationPipe", () => {
  it("通れば、スキーマで整えた値を返す", () => {
    expect(pipe.transform({ title: " 牛乳 " })).toEqual({ title: "牛乳" });
  });

  it("欄ごとのエラーは fieldErrors と message に入る", () => {
    const body = badRequestBody({ title: "", status: "archived" });
    expect(body).toMatchObject({
      statusCode: 400,
      fieldErrors: { title: expect.any(Array), status: expect.any(Array) },
    });
    expect((body as { message: string[] }).message).toEqual(
      expect.arrayContaining([expect.stringMatching(/^title: /), expect.stringMatching(/^status: /)]),
    );
  });

  it("知らないプロパティは formErrors に入る", () => {
    const body = badRequestBody({ title: "x", owner: "jiro" });
    expect(body).toMatchObject({ formErrors: [expect.stringContaining("owner")], fieldErrors: {} });
  });
});
