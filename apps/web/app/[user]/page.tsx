import { notFound } from "next/navigation";
import type { Todo, TodoStatus } from "@todo/types";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

const STATUS_LABEL: Record<TodoStatus, string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
};

async function fetchTodos(user: string): Promise<Todo[]> {
  const res = await fetch(`${API_URL}/${encodeURIComponent(user)}/todos`, { cache: "no-store" });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "-";
  const [, month, day] = dueDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

export default async function UserTodosPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const todos = await fetchTodos(user);

  return (
    <main>
      <h1>{user} の Todo</h1>
      {todos.length === 0 ? (
        <p>Todo はまだありません。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>タスク名</th>
              <th>締め切り</th>
              <th>進捗</th>
              <th>タグ</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.id}>
                <td>{todo.title}</td>
                <td>{formatDueDate(todo.dueDate)}</td>
                <td>{STATUS_LABEL[todo.status]}</td>
                <td>
                  {todo.tags.map((tag) => (
                    <span key={tag.id} className="tag">
                      {tag.name}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
