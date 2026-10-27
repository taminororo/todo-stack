import type { Tag, Todo } from "@todo/types";

export const tags: Tag[] = [
	{ id: 1, name: "買い物" },
	{ id: 2, name: "仕事" },
];

export function makeTodo(overrides: Partial<Todo> = {}): Todo {
	return {
		id: 1,
		title: "牛乳を買う",
		dueDate: null,
		status: "todo",
		tags: [],
		owner: "taro",
		...overrides,
	};
}
