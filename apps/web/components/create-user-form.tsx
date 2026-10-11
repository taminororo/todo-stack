"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateUserRequestSchema } from "@todo/types";
import { useCreateUser } from "@/lib/query/users";

export function CreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const create = useCreateUser();
  // API と同じスキーマで確かめる。送る前に分かる誤りは、ここで止める
  const parsed = CreateUserRequestSchema.safeParse({ name });
  const empty = name.trim() === "";
  const invalid = !empty && !parsed.success;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!parsed.success) return;
    create.mutate(parsed.data, { onSuccess: (user) => router.push(`/${encodeURIComponent(user.name)}`) });
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
        <Button type="submit" variant="secondary" disabled={!parsed.success || create.isPending}>
          {create.isPending ? "作成中…" : "作成"}
        </Button>
      </div>
      <p id="new-user-name-hint" className={invalid ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
        文字・数字・「_」「-」で 30 文字まで。
      </p>
    </form>
  );
}
