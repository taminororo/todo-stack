import Link from "next/link";
import { notFound } from "next/navigation";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ArrowLeftIcon } from "lucide-react";
import { TodoBoard } from "./components/todo-board";
import { Button } from "@todo/ui/components/button";
import { ApiUnavailable } from "./components/api-unavailable";
import { ApiError, ApiUnavailableError } from "@todo/api-client";
import { getQueryClient, tagsQuery, todosQuery } from "@todo/api-hooks";

// サーバーで先に取得してキャッシュに入れ、HydrationBoundary でブラウザの QueryClient に渡す。
// 404 と接続失敗はここで見分けたいので、エラーを投げる fetchQuery を使う。
async function prefetch(user: string) {
  const queryClient = getQueryClient();
  try {
    await queryClient.fetchQuery(todosQuery(user));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    if (e instanceof ApiUnavailableError) return null;
    throw e;
  }
  // タグは取れなくても画面は出せるので、失敗を投げない prefetchQuery にする
  await queryClient.prefetchQuery(tagsQuery(user));
  return queryClient;
}

export default async function UserTodosPage({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  const queryClient = await prefetch(user);

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
      {queryClient ? (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <TodoBoard user={user} />
        </HydrationBoundary>
      ) : (
        <ApiUnavailable />
      )}
    </main>
  );
}
