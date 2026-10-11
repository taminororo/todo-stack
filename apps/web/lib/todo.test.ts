import { describe, expect, it } from "vitest";
import { makeTodo } from "@/test/fixtures";
import { formatDueDate, isOverdue, todayString } from "./todo";

describe("formatDueDate", () => {
  it("YYYY-MM-DD を M/D にする", () => expect(formatDueDate("2026-08-01")).toBe("8/1"));
  it("締め切りなしは - にする", () => expect(formatDueDate(null)).toBe("-"));
});

describe("todayString", () => {
  it("ローカル時刻の日付を 0 埋めで返す", () => expect(todayString(new Date(2026, 0, 5))).toBe("2026-01-05"));
});

describe("isOverdue", () => {
  const today = "2026-10-12";
  it("締め切りを過ぎた未完了は期限切れ", () => expect(isOverdue(makeTodo({ dueDate: "2026-10-11" }), today)).toBe(true));
  it("今日が締め切りなら期限切れではない", () => expect(isOverdue(makeTodo({ dueDate: today }), today)).toBe(false));
  it("完了していれば期限切れにしない", () =>
    expect(isOverdue(makeTodo({ dueDate: "2026-10-01", status: "done" }), today)).toBe(false));
});
