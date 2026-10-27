import {
	type AddTagRequest,
	type CreateTodoRequest,
	type CreateUserRequest,
	TagSchema,
	TodoSchema,
	type UpdateTodoRequest,
	UserSchema,
} from "@todo/types";
import { z } from "zod";

// サーバーでは API に直接つなぐ。ブラウザでは next.config.ts の rewrites（/api → API_URL）を通す。
// API に CORS 設定がないので、ブラウザからは同じオリジンの /api に送る。
const API_URL =
	typeof window === "undefined"
		? (process.env.API_URL ?? "http://localhost:8080")
		: "/api";

export class ApiError extends Error {
	constructor(
		public readonly status: number,
		message: string,
	) {
		super(message);
	}
}

// API に接続できなかった（起動前・再起動中など）。ステータスコードはない。
export class ApiUnavailableError extends Error {
	constructor(cause: unknown) {
		super(`API に接続できません (${API_URL})`, { cause });
	}
}

// API の応答が @todo/types のスキーマと合わなかった。API と Web の版がずれたときなどに起きる。
export class ApiResponseError extends Error {
	constructor(path: string, cause: z.ZodError) {
		super(`API の応答の形が想定と違います (${path})`, { cause });
	}
}

// 本体を返すエンドポイント。応答をスキーマで確かめてから返すので、戻り値の型は実際の中身と一致する
async function request<S extends z.ZodType>(
	path: string,
	schema: S,
	init?: RequestInit,
): Promise<z.output<S>> {
	const res = await send(path, init);
	const result = schema.safeParse(await res.json());
	if (!result.success) throw new ApiResponseError(path, result.error);
	return result.data;
}

// DELETE など、本体なし（204）で返ってくるエンドポイント
async function requestNoContent(
	path: string,
	init?: RequestInit,
): Promise<void> {
	await send(path, init);
}

async function send(path: string, init?: RequestInit): Promise<Response> {
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
	if (!res.ok)
		throw new ApiError(
			res.status,
			`API error: ${res.status} ${init?.method ?? "GET"} ${path}`,
		);
	return res;
}

const userPath = (user: string) => `/${encodeURIComponent(user)}`;

export const api = {
	listUsers: () => request("/users", z.array(UserSchema)),
	createUser: (body: CreateUserRequest) =>
		request("/users", UserSchema, {
			method: "POST",
			body: JSON.stringify(body),
		}),
	listTodos: (user: string) =>
		request(`${userPath(user)}/todos`, z.array(TodoSchema)),
	listTags: (user: string) =>
		request(`${userPath(user)}/tags`, z.array(TagSchema)),
	createTodo: (user: string, body: CreateTodoRequest) =>
		request(`${userPath(user)}/todos`, TodoSchema, {
			method: "POST",
			body: JSON.stringify(body),
		}),
	updateTodo: (user: string, id: number, body: UpdateTodoRequest) =>
		request(`${userPath(user)}/todos/${id}`, TodoSchema, {
			method: "PATCH",
			body: JSON.stringify(body),
		}),
	deleteTodo: (user: string, id: number) =>
		requestNoContent(`${userPath(user)}/todos/${id}`, { method: "DELETE" }),
	addTag: (user: string, id: number, body: AddTagRequest) =>
		request(`${userPath(user)}/todos/${id}/tags`, TodoSchema, {
			method: "POST",
			body: JSON.stringify(body),
		}),
	removeTag: (user: string, id: number, tagId: number) =>
		requestNoContent(`${userPath(user)}/todos/${id}/tags/${tagId}`, {
			method: "DELETE",
		}),
};
