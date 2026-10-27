"use client";

import type { TodoStatus } from "@todo/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@todo/ui/components/select";
import { STATUS_OPTIONS } from "../todo";

export function StatusSelect({
	value,
	onValueChange,
	disabled,
	size = "default",
	id,
}: {
	value: TodoStatus;
	onValueChange: (value: TodoStatus) => void;
	disabled?: boolean;
	size?: "sm" | "default";
	id?: string;
}) {
	return (
		<Select
			value={value}
			onValueChange={(v) => onValueChange(v as TodoStatus)}
			disabled={disabled}
		>
			<SelectTrigger id={id} size={size} className="w-28" aria-label="進捗">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{STATUS_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
