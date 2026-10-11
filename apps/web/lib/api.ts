import type {
  AddTagRequest,
  CreateTodoRequest,
  CreateUserRequest,
  Tag,
  Todo,
  UpdateTodoRequest,
  User,
} from "@todo/types";

// サーバーでは API に直接つなぐ。ブラウザでは next.config.ts の rewrites（/api → API_URL）を通す。
// API に CORS 設定がないので、ブラウザからは同じオリジンの /api に送る。
const API_URL = typeof window === "undefined" ? (process.env.API_URL ?? "http://localhost:8080") : "/api";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// API に接続できなかった（起動前・再起動中など）。ステータスコードはない。
export class ApiUnavailableError extends Error {
  constructor(cause: unknown) {
    super(`API に接続できません (${API_URL})`, { cause });
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (e) {
    throw new ApiUnavailableError(e);
  }
  if (!res.ok) throw new ApiError(res.status, `API error: ${res.status} ${init?.method ?? "GET"} ${path}`);
  // DELETE などは本体なしで返ってくる
  if (res.status === 204 || res.headers.get("content-length") === "0") return undefined as T;
  return res.json();
}

const userPath = (user: string) => `/${encodeURIComponent(user)}`;

export const api = {
  listUsers: () => request<User[]>("/users"),
  createUser: (body: CreateUserRequest) =>
    request<User>("/users", { method: "POST", body: JSON.stringify(body) }),
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
