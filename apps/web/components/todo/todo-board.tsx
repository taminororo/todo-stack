"use client";

import { useTags, useTodos } from "@/lib/query/todos";
import { TodoTable } from "./todo-table";

// キャッシュから Todo とタグを読んで表に渡す。サーバーで prefetch 済みなら最初から data がある。
export function TodoBoard({ user }: { user: string }) {
  const todos = useTodos(user);
  const tags = useTags(user);

  if (todos.isPending) return <p className="text-sm text-muted-foreground">読み込み中…</p>;
  if (todos.isError) return <p className="text-sm text-destructive">Todo を読み込めませんでした: {todos.error.message}</p>;

  return <TodoTable user={user} todos={todos.data} userTags={tags.data ?? []} />;
}
