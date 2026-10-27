import { TODO_STATUSES, type Todo, type TodoStatus } from "@todo/types";

export const STATUS_LABEL: Record<TodoStatus, string> = {
	todo: "未着手",
	doing: "進行中",
	done: "完了",
};

export const STATUS_OPTIONS = TODO_STATUSES.map((value) => ({
	value,
	label: STATUS_LABEL[value],
}));

// "2026-08-31" → "8/31"
export function formatDueDate(dueDate: string | null): string {
	if (!dueDate) return "-";
	const [, month, day] = dueDate.split("-");
	return `${Number(month)}/${Number(day)}`;
}

// 今日の日付を "YYYY-MM-DD"（ローカル時刻）で返す。dueDate と文字列のまま比べられる。
export function todayString(now = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isOverdue(todo: Todo, today = todayString()): boolean {
	return (
		todo.status !== "done" && todo.dueDate !== null && todo.dueDate < today
	);
}

const STATUS_RANK: Record<TodoStatus, number> = {
	doing: 0,
	todo: 1,
	done: 2,
};
export function compareTodos(a: Todo, b: Todo): number {
	const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
	if (byStatus !== 0) return byStatus;

	if (a.dueDate !== b.dueDate) {
		if (a.dueDate === null) return 1;
		if (b.dueDate === null) return -1;

		return a.dueDate < b.dueDate ? -1 : 1;
	}

	return a.id - b.id;
}
