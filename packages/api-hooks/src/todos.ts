"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CreateTodoRequest, Todo, UpdateTodoRequest } from "@todo/types";
import { toast } from "sonner";
import { api } from "@todo/api-client";
import { todoKeys } from "./keys";
import { tagsQuery, todosQuery } from "./options";

export const useTodos = (user: string) => useQuery(todosQuery(user));
export const useTags = (user: string) => useQuery(tagsQuery(user));

function showError(error: Error) {
  toast.error("保存できませんでした", { description: error.message });
}

// 書き込みのあとは、そのユーザーの Todo とタグをまとめて取り直す（タグは追加で増えることがある）
function useInvalidateUser(user: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: todoKeys.user(user) });
}

export function useCreateTodo(user: string) {
  const invalidate = useInvalidateUser(user);
  return useMutation({
    mutationFn: (body: CreateTodoRequest) => api.createTodo(user, body),
    onError: showError,
    onSettled: invalidate,
  });
}

export function useUpdateTodo(user: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateUser(user);
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: UpdateTodoRequest }) => api.updateTodo(user, id, changes),
    // 楽観的更新: API の応答を待たずにキャッシュを書き換え、表をすぐ並べ替える。
    // 返した値は onError の context に渡るので、失敗したらそれで元に戻す。
    onMutate: async ({ id, changes }): Promise<{ previous?: Todo[] }> => {
      const key = todoKeys.todos(user);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Todo[]>(key);

      queryClient.setQueryData<Todo[]>(key, (old) =>
        old?.map((todo) => (todo.id === id ? { ...todo, ...changes } : todo)),
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(todoKeys.todos(user), context.previous);
      showError(error);
    },
    onSettled: invalidate,
  });
}

export function useDeleteTodo(user: string) {
  const invalidate = useInvalidateUser(user);
  return useMutation({
    mutationFn: (id: number) => api.deleteTodo(user, id),
    onError: showError,
    onSettled: invalidate,
  });
}

export function useAddTag(user: string) {
  const invalidate = useInvalidateUser(user);
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => api.addTag(user, id, { name }),
    onError: showError,
    onSettled: invalidate,
  });
}

export function useRemoveTag(user: string) {
  const invalidate = useInvalidateUser(user);
  return useMutation({
    mutationFn: ({ id, tagId }: { id: number; tagId: number }) => api.removeTag(user, id, tagId),
    onError: showError,
    onSettled: invalidate,
  });
}
