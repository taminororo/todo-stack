"use client";

import { useCreateUser } from "@todo/api-hooks";
import { CreateUserRequestSchema } from "@todo/types";
import { Button } from "@todo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@todo/ui/components/dialog";
import { Input } from "@todo/ui/components/input";
import { Label } from "@todo/ui/components/label";
import { useRouter } from "next/navigation";
import { type SyntheticEvent, useState } from "react";

export function CreateUserForm() {
	const router = useRouter();
	const [name, setName] = useState("");
	const create = useCreateUser();
	// API と同じスキーマで確かめる。送る前に分かる誤りは、ここで止める
	const parsed = CreateUserRequestSchema.safeParse({ name });
	const empty = name.trim() === "";
	const invalid = !empty && !parsed.success;

	const [open, setOpen] = useState(false);

	// 作成ボタン（と Enter キー）では、送らずに確認ダイアログを開く
	function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!parsed.success) return;
		setOpen(true);
	}

	// 「はい」を押したときだけ、従来の作成処理を行う。それ以外で閉じたときは何も送らない
	function handleConfirm() {
		if (!parsed.success) return;
		setOpen(false);
		create.mutate(parsed.data, {
			onSuccess: (user) => router.push(`/${encodeURIComponent(user.name)}`),
		});
	}

	return (
		<form onSubmit={handleSubmit} className="grid gap-2">
			<Label htmlFor="new-user-name">新しいユーザー</Label>
			<div className="flex gap-2">
				<Input
					id="new-user-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="例: hanako"
					aria-invalid={invalid}
					aria-describedby="new-user-name-hint"
				/>
				
					<Button
						type="submit"
						variant="secondary"
						disabled={!parsed.success || create.isPending}
					>
						{create.isPending ? "作成中…" : "作成"}
					</Button>
					<Dialog open={open} onOpenChange={(next) => setOpen(next)}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>新しいユーザーを作成しますか？</DialogTitle>
								<DialogDescription>
									作成ボタンを押すと、ユーザーが作成されます。この操作は取り消せません。
								</DialogDescription>
							</DialogHeader>
							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={() => setOpen(false)}
								>
									キャンセル
								</Button>
								<Button type="button" onClick={handleConfirm}>
									はい
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				
			</div>
			<p
				id="new-user-name-hint"
				className={
					invalid ? "text-sm text-destructive" : "text-sm text-muted-foreground"
				}
			>
				文字・数字・「_」「-」で 30 文字まで。
			</p>
		</form>
	);
}
