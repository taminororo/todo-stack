"use client";

import { useState } from "react";
import type { Tag, Todo } from "@todo/types";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { deleteTodo } from "@/app/[user]/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TodoFormDialog } from "./todo-form-dialog";
import { useTodoAction } from "./use-todo-action";

export function TodoRowActions({ todo, userTags }: { todo: Todo; userTags: Tag[] }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { pending, run } = useTodoAction();

  return (
    <div className="flex justify-end gap-1">
      <TodoFormDialog mode="edit" user={todo.owner} todo={todo} userTags={userTags}>
        <Button variant="ghost" size="icon-sm" aria-label="編集">
          <PencilIcon />
        </Button>
      </TodoFormDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="その他の操作">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2Icon />
            削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>「{todo.title}」を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>この操作は取り消せません。付いているタグ自体は残ります。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={(e) => {
                // 閉じるのは削除が終わってから
                e.preventDefault();
                run(() => deleteTodo(todo.owner, todo.id), () => setConfirmOpen(false));
              }}
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
