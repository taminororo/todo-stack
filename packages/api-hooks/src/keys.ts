// クエリキーはここでだけ組み立てる。["users", user] で始まるので、そのユーザーの分をまとめて無効化できる。
export const todoKeys = {
	user: (user: string) => ["users", user] as const,
	todos: (user: string) => [...todoKeys.user(user), "todos"] as const,
	tags: (user: string) => [...todoKeys.user(user), "tags"] as const,
};
