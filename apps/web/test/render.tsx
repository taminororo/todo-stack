import type { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "@todo/ui/components/sonner";

// テストごとに新しい QueryClient を作り、キャッシュがテスト間で漏れないようにする。
// retry は切る（失敗のテストで 3 回待たされないように）。
export function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      {ui}
      <Toaster />
    </QueryClientProvider>,
  );
  return { ...result, user, queryClient };
}
