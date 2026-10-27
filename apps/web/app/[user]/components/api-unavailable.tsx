"use client";

import { Button } from "@todo/ui/components/button";
import { RefreshCwIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function ApiUnavailable() {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	return (
		<div className="grid justify-items-center gap-3 rounded-lg border border-dashed px-4 py-12 text-center">
			<p className="font-medium">API に接続できません</p>
			<p className="text-sm text-muted-foreground">
				起動中か、再起動しているところかもしれません。少し待ってからもう一度読み込んでください。
			</p>
			<Button
				variant="outline"
				disabled={pending}
				onClick={() => startTransition(() => router.refresh())}
			>
				<RefreshCwIcon className={pending ? "animate-spin" : undefined} />
				再読み込み
			</Button>
		</div>
	);
}
