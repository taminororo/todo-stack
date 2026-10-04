// アプリ全体で使う Todo の形。ここが唯一の定義場所で、api も web もこれを import する。

// ユーザーは URL に含める（例: /taro/todos）。そのため owner はリクエストの本体には入れない。

export const TODO_STATUSES = ["todo", "doing", "done"]
// 配列からTodoStatusというunionを作ってる
export type TodoStatus = (typeof TODO_STATUSES)[number];

// タグ1つぶん。外すときは id で指定する。
export interface Tag {
  id: number;
  name: string; // 例: "買い物"
}

// GET /:user/todos が返す1行ぶん。例: 牛乳を買う | 8/31 | todo | 買い物, 食品 | taro
export interface Todo {
  id: number;
  title: string; // タスク名
  dueDate: string | null; // 締め切り。"2026-08-31" の形（YYYY-MM-DD）。締め切りなしは null
  status: TodoStatus; // 進捗ステータス
  tags: Tag[]; // 付いているタグ。なければ []
  owner: string; // 持ち主のユーザー名。例: "taro"
}

// POST /:user/todos: 行を追加する。title だけ必須。
// 省略したときは dueDate = null、status = "todo"、tags = [] になる。
// tags はタグ名で渡す。そのユーザーにまだないタグは、新しく作る。
export interface CreateTodoRequest {
  title: string;
  dueDate?: string | null;
  status?: TodoStatus;
  tags?: string[];
}

// PATCH /:user/todos/:id: 送ったフィールドだけを変える。タグは別のエンドポイントで操作する。
export type UpdateTodoRequest = Partial<Pick<Todo, "title" | "dueDate" | "status">>;

// DELETE /:user/todos/:id: 本体なし。

// POST /:user/todos/:id/tags: その Todo にタグを1つ付ける。なければそのユーザーのタグとして作る。
export interface AddTagRequest {
  name: string;
}

// DELETE /:user/todos/:id/tags/:tagId: その Todo からタグを外す。本体なし。タグ自体は残る。

// GET /:user/tags: そのユーザーのタグの一覧（Tag[]）を返す。
// Todo の追加フォームやタグを付けるときの候補に使う。
