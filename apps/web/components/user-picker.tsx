"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: taro" />
        <Button type="submit" disabled={!name.trim()}>
          開く
        </Button>
      </div>
    </form>
  );
}
