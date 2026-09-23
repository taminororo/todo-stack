// §2 の確認用。まだ NestJS ではない。
// 別フォルダにある packages/types の型が、ここから import できることだけを確かめる。
import type { Todo, CreateTodoRequest } from "@todo/types";

const draft: CreateTodoRequest = { title: "牛乳を買う", status: "todo" };
const saved: Todo = { id: 1, ...draft };

console.log("[api] packages/types の型が使えています:", saved);
