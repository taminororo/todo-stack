"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateUser } from "@/lib/query/users";

// API の CreateUserDto と同じ条件。送る前に分かる誤りは、ここで止める
const NAME_PATTERN = /^[\p{L}\p{N}_-]+$/u;

export function CreateUserForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const create = useCreateUser();
  const trimmed = name.trim();
  const invalid = trimmed !== "" && (!NAME_PATTERN.test(trimmed) || trimmed.length > 30 || trimmed === "api");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!trimmed || invalid) return;
    create.mutate({ name: trimmed }, { onSuccess: (user) => router.push(`/${encodeURIComponent(user.name)}`) });
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
        <Button type="submit" variant="secondary" disabled={!trimmed || invalid || create.isPending}>
          {create.isPending ? "作成中…" : "作成"}
        </Button>
      </div>
      <p id="new-user-name-hint" className={invalid ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
        文字・数字・「_」「-」で 30 文字まで。
      </p>
    </form>
  );
}
