import { z } from "zod";

export const UserSchema = z.object({
	id: z.number().int(),
	name: z.string(), // URL の /:user に入る名前。例: "taro"
});
export type User = z.infer<typeof UserSchema>;

// name はそのまま URL の /:user になるので、区切り文字や空白を含まない形だけ受け付ける。
// 前後の空白は落としてから確かめる（フォームで " hanako " と打っても通る）
export const UserNameSchema = z
	.string()
	.trim()
	.min(1, "name must not be empty")
	.max(30)
	.regex(
		/^[\p{L}\p{N}_-]+$/u,
		"name may only contain letters, numbers, _ and -",
	)
	// Web の /api/* は API への中継に使っているので、この名前のページは開けない
	.refine((name) => name !== "api", 'name must not be "api"');

// POST /users: ユーザーを1人作る。作ったユーザー（User）を返す。
// 同じ名前のユーザーがもういれば 409 を返す。
export const CreateUserRequestSchema = z.strictObject({
	name: UserNameSchema,
});
export type CreateUserRequest = z.input<typeof CreateUserRequestSchema>;

// GET /users: ユーザーの一覧（User[]）を名前順で返す。
