// アプリ全体で使う Todo の形。ここが唯一の定義場所で、api も web もこれを import する。
// ts-basics/src/types/todo.ts で書いたものを持ってきた。

export type TodoStatus = "todo" | "doing" | "done";

export interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
}

// API のリクエストの形は、Todo から派生させる (ts-basics の 04 でやった形)
export type CreateTodoRequest = Omit<Todo, "id">;
export type UpdateTodoRequest = Partial<CreateTodoRequest>;

