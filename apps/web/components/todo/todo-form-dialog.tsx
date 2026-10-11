"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  CreateTodoRequestSchema,
  UpdateTodoRequestSchema,
  type Tag,
  type Todo,
  type TodoStatus,
  type UpdateTodoRequest,
} from "@todo/types";
import { PlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusSelect } from "./status-select";
import { useCreateTodo, useUpdateTodo } from "@/lib/query/todos";
import { TagCombobox } from "./tag-combobox";

type Props = { user: string; userTags: Tag[]; children: ReactNode } & (
  | { mode: "create"; todo?: undefined }
  | { mode: "edit"; todo: Todo }
);

// 追加（POST）と編集（PATCH）の共通フォーム。タグは追加のときだけ選べる。
// 編集中のタグは一覧の行から操作する（API がタグを別エンドポイントに分けているため）。
export function TodoFormDialog({ user, userTags, mode, todo, children }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<TodoStatus>("todo");
  const [tags, setTags] = useState<string[]>([]);
  const create = useCreateTodo(user);
  const update = useUpdateTodo(user);
  const pending = create.isPending || update.isPending;
  const close = () => setOpen(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setTitle(todo?.title ?? "");
      setDueDate(todo?.dueDate ?? "");
      setStatus(todo?.status ?? "todo");
      setTags([]);
    }
    setOpen(next);
  }

  // API と同じスキーマで確かめる（空白だけ・101 文字以上のタスク名などは送らない）
  const parsed = CreateTodoRequestSchema.safeParse({ title, dueDate: dueDate || null, status, tags });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!parsed.success) return;

    if (mode === "create") {
      create.mutate(parsed.data, { onSuccess: close });
      return;
    }
    // PATCH は送ったフィールドだけ変わるので、変えたものだけ送る
    const { title: nextTitle, dueDate: nextDue = null, status: nextStatus } = parsed.data;
    const changes: UpdateTodoRequest = {};
    if (nextTitle !== todo.title) changes.title = nextTitle;
    if (nextDue !== todo.dueDate) changes.dueDate = nextDue;
    if (nextStatus !== todo.status) changes.status = nextStatus;
    if (Object.keys(changes).length === 0) return close();
    update.mutate({ id: todo.id, changes: UpdateTodoRequestSchema.parse(changes) }, { onSuccess: close });
  }

  const candidates = userTags.map((tag) => tag.name).filter((name) => !tags.includes(name));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Todo を追加" : "Todo を編集"}</DialogTitle>
            <DialogDescription>タスク名だけ必須です。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="todo-title">タスク名</Label>
            <Input
              id="todo-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 牛乳を買う"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="todo-due">締め切り</Label>
              <Input id="todo-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="todo-status">進捗</Label>
              <StatusSelect id="todo-status" value={status} onValueChange={setStatus} />
            </div>
          </div>

          {mode === "create" && (
            <div className="grid gap-2">
              <Label>タグ</Label>
              <div className="flex flex-wrap items-center gap-1">
                {tags.map((name) => (
                  <Badge key={name} variant="secondary" className="gap-0.5 pr-0.5">
                    {name}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-foreground/10"
                      aria-label={`タグ「${name}」を外す`}
                      onClick={() => setTags(tags.filter((t) => t !== name))}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))}
                <TagCombobox candidates={candidates} onSelect={(name) => setTags([...tags, name])}>
                  <Button type="button" variant="outline" size="xs">
                    <PlusIcon />
                    タグ
                  </Button>
                </TagCombobox>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                キャンセル
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || !parsed.success}>
              {pending ? "保存中…" : mode === "create" ? "追加" : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
