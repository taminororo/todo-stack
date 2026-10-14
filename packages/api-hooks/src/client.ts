import { QueryClient, isServer } from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // サーバーで取得した直後に、ブラウザがすぐ取り直さないようにする
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

// サーバーではリクエストごとに新しく作る（ユーザー間でキャッシュを共有しない）。
// ブラウザでは1つを使い回す（React が再レンダーしてもキャッシュが消えない）。
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
