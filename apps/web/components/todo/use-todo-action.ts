"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/[user]/actions";

// Server Action を transition の中で呼び、失敗したら toast を出す。
export function useTodoAction() {
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, onSuccess?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) onSuccess?.();
      else toast.error("保存できませんでした", { description: result.error });
    });
  }

  return { pending, run };
}
