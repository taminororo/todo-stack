import "server-only";
import type {
  AddTagRequest,
  CreateTodoRequest,
  Tag,
  Todo,
  UpdateTodoRequest,
} from "@todo/types";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new ApiError(res.status, `API error: ${res.status} ${init?.method ?? "GET"} ${path}`);
  // DELETE などは本体なしで返ってくる
  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  return res.json();
}

const userPath = (user: string) => `/${encodeURIComponent(user)}`;

export const api = {
  listTodos: (user: string) => request<Todo[]>(`${userPath(user)}/todos`),
  listTags: (user: string) => request<Tag[]>(`${userPath(user)}/tags`),
  createTodo: (user: string, body: CreateTodoRequest) =>
    request<Todo>(`${userPath(user)}/todos`, { method: "POST", body: JSON.stringify(body) }),
  updateTodo: (user: string, id: number, body: UpdateTodoRequest) =>
    request<Todo>(`${userPath(user)}/todos/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTodo: (user: string, id: number) =>
    request<void>(`${userPath(user)}/todos/${id}`, { method: "DELETE" }),
  addTag: (user: string, id: number, body: AddTagRequest) =>
    request<Todo>(`${userPath(user)}/todos/${id}/tags`, { method: "POST", body: JSON.stringify(body) }),
  removeTag: (user: string, id: number, tagId: number) =>
    request<void>(`${userPath(user)}/todos/${id}/tags/${tagId}`, { method: "DELETE" }),
};
