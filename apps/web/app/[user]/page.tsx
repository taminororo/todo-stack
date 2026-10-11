import Link from "next/link";
import { notFound } from "next/navigation";
import type { Tag, Todo } from "@todo/types";
import { ArrowLeftIcon } from "lucide-react";
import { TodoTable } from "@/components/todo/todo-table";
import { Button } from "@/components/ui/button";
import { ApiError, api } from "@/lib/api";

async function fetchTodos(user: string): Promise<Todo[]> {
  try {
    return await api.listTodos(user);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

// GET /:user/tags がまだ使えないときは、Todo に付いているタグから候補を作る
async function fetchTags(user: string, todos: Todo[]): Promise<Tag[]> {
  try {
    return await api.listTags(user);
  } catch {
    const byId = new Map(todos.flatMap((todo) => todo.tags).map((tag) => [tag.id, tag]));
    return [...byId.values()];
  }
}

export default async function UserTodosPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const todos = await fetchTodos(user);
  const tags = await fetchTags(user, todos);

  return (
    <main className="mx-auto grid max-w-4xl gap-6 px-4 py-10">
      <div className="grid gap-1">
        <Button variant="link" size="sm" className="w-fit px-0 text-muted-foreground" asChild>
          <Link href="/">
            <ArrowLeftIcon />
            ユーザーを選ぶ
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{user} の Todo</h1>
      </div>
      <TodoTable user={user} todos={todos} userTags={tags} />
    </main>
  );
}
