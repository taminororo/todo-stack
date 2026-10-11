"use server";

import { revalidatePath } from "next/cache";
import type { CreateTodoRequest, UpdateTodoRequest } from "@todo/types";
import { api } from "@/lib/api";

export type ActionResult = { ok: true } | { ok: false; error: string };

// API を呼んだあと、そのユーザーのページを作り直す。失敗はクライアントで toast に出す。
async function run(user: string, call: () => Promise<unknown>): Promise<ActionResult> {
  try {
    await call();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "不明なエラー" };
  }
  revalidatePath(`/${encodeURIComponent(user)}`);
  return { ok: true };
}

export async function createTodo(user: string, body: CreateTodoRequest) {
  return run(user, () => api.createTodo(user, body));
}

export async function updateTodo(user: string, id: number, body: UpdateTodoRequest) {
  return run(user, () => api.updateTodo(user, id, body));
}

export async function deleteTodo(user: string, id: number) {
  return run(user, () => api.deleteTodo(user, id));
}

export async function addTag(user: string, id: number, name: string) {
  return run(user, () => api.addTag(user, id, { name }));
}

export async function removeTag(user: string, id: number, tagId: number) {
  return run(user, () => api.removeTag(user, id, tagId));
}
