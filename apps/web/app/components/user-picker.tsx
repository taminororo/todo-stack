"use client";

import { Button } from "@todo/ui/components/button";
import { Input } from "@todo/ui/components/input";
import { Label } from "@todo/ui/components/label";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function UserPicker() {
	const router = useRouter();
	const [name, setName] = useState("");

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const trimmed = name.trim();
		if (trimmed) router.push(`/${encodeURIComponent(trimmed)}`);
	}

	return (
		<form onSubmit={handleSubmit} className="grid gap-2">
			<Label htmlFor="user-name">ユーザー名</Label>
			<div className="flex gap-2">
				<Input
					id="user-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="例: taro"
				/>
				<Button type="submit" disabled={!name.trim()}>
					開く
				</Button>
			</div>
		</form>
	);
}
