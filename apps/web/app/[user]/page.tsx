import { notFound } from "next/navigation";
import type { Todo, TodoStatus } from "@todo/types";

// API の場所。画面を作るサーバー（Next.js）が、このアドレスの API を呼ぶ。
const API_URL = process.env.API_URL ?? "http://localhost:3000";

const STATUS_LABEL: Record<TodoStatus, string> = {
  todo: "未着手",
  doing: "進行中",
  done: "完了",
};

async function fetchTodos(user: string): Promise<Todo[]> {
  // no-store: 毎回 API に聞き直す（古い一覧をキャッシュしない）
  const res = await fetch(`${API_URL}/${encodeURIComponent(user)}/todos`, { cache: "no-store" });
  if (res.status === 404) notFound(); // API が「そのユーザーはいない」と答えたら、404 ページにする
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// "2026-08-31" → "8/31"。Date を経由しないので、タイムゾーンでずれない。
function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return "-";
  const [, month, day] = dueDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

// Server Component: このファイルはブラウザではなく、Next.js のサーバーで実行される。
// async にして、API からの取得を await で待ってから、HTML を組み立てて返す。
// URL の /taro の部分が、params.user に入る。
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
