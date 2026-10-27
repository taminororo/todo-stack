import { z } from "zod";

// スキーマが「正」で、型はそこから z.infer で作る。
// API は受け取った本体をこのスキーマで検証し、Web は送る前のフォームと受け取った応答を同じスキーマで検証する。

export const TODO_STATUSES = ["todo", "doing", "done"] as const;
export const TodoStatusSchema = z.enum(TODO_STATUSES);
export type TodoStatus = z.infer<typeof TodoStatusSchema>;

// タグ名。前後の空白を除いて 1〜30 文字
export const TagNameSchema = z
	.string()
	.trim()
	.min(1, "tag name must not be blank")
	.max(30);

// 締め切り。"2026-08-31" の形（YYYY-MM-DD）だけ。null は「締め切りなし」
export const DueDateSchema = z.iso.date().nullable();

export const TagSchema = z.object({
	id: z.number().int(),
	name: z.string(), // 例: "買い物"
});
export type Tag = z.infer<typeof TagSchema>;

// GET /:user/todos が返す1行ぶん。例: 牛乳を買う | 8/31 | todo | 買い物, 食品 | taro
export const TodoSchema = z.object({
	id: z.number().int(),
	title: z.string(), // タスク名
	dueDate: DueDateSchema, // 締め切り
	status: TodoStatusSchema, // 進捗ステータス
	tags: z.array(TagSchema), // 付いているタグ。なければ []
	owner: z.string(), // 持ち主のユーザー名。例: "taro"
});
export type Todo = z.infer<typeof TodoSchema>;

// POST /:user/todos: 行を追加する。title だけ必須。
// 省略したときは dueDate = null、status = "todo"、tags = [] になる。
// tags はタグ名で渡す。そのユーザーにまだないタグは、新しく作る。
// strictObject: 知らないプロパティ（owner など）が来たら弾く
export const CreateTodoRequestSchema = z.strictObject({
	title: z.string().trim().min(1, "title must not be blank").max(100),
	dueDate: DueDateSchema.optional(),
	status: TodoStatusSchema.optional(),
	tags: z.array(TagNameSchema).max(20).optional(),
});
export type CreateTodoRequest = z.input<typeof CreateTodoRequestSchema>;

// PATCH /:user/todos/:id: 送ったフィールドだけを変える。タグは別のエンドポイントで操作する。
export const UpdateTodoRequestSchema = CreateTodoRequestSchema.omit({
	tags: true,
}).partial();
export type UpdateTodoRequest = z.input<typeof UpdateTodoRequestSchema>;

// DELETE /:user/todos/:id: 本体なし。

// POST /:user/todos/:id/tags: その Todo にタグを1つ付ける。なければそのユーザーのタグとして作る。
export const AddTagRequestSchema = z.strictObject({
	name: TagNameSchema,
});
export type AddTagRequest = z.input<typeof AddTagRequestSchema>;

// DELETE /:user/todos/:id/tags/:tagId: その Todo からタグを外す。本体なし。タグ自体は残る。

// GET /:user/tags: そのユーザーのタグの一覧（Tag[]）を返す。
// Todo の追加フォームやタグを付けるときの候補に使う。
