import { queryOptions } from "@tanstack/react-query";
import { api } from "@todo/api-client";
import { todoKeys } from "./keys";

// サーバーの prefetch とクライアントの useQuery で同じ定義を使う
export const todosQuery = (user: string) =>
	queryOptions({
		queryKey: todoKeys.todos(user),
		queryFn: () => api.listTodos(user),
	});

export const tagsQuery = (user: string) =>
	queryOptions({
		queryKey: todoKeys.tags(user),
		queryFn: () => api.listTags(user),
	});
