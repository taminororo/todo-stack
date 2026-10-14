"use client";

import { useState } from "react";
import type { Tag, Todo, TodoStatus } from "@todo/types";
import { PlusIcon } from "lucide-react";
import { Button } from "@todo/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@todo/ui/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@todo/ui/components/table";
import { cn } from "@todo/ui/lib/utils";
import { useUpdateTodo } from "@todo/api-hooks";
import { STATUS_OPTIONS, compareTodos, formatDueDate, isOverdue, todayString } from "../todo";
import { StatusSelect } from "./status-select";
import { TodoFormDialog } from "./todo-form-dialog";
import { TodoRowActions } from "./todo-row-actions";
import { TodoTags } from "./todo-tags";

type Filter = TodoStatus | "all";

function StatusCell({ todo }: { todo: Todo }) {
  const update = useUpdateTodo(todo.owner);
  return (
    <StatusSelect
      size="sm"
      value={todo.status}
      disabled={update.isPending}
      onValueChange={(status) => update.mutate({ id: todo.id, changes: { status } })}
    />
  );
}

export function TodoTable({ user, todos, userTags }: { user: string; todos: Todo[]; userTags: Tag[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const today = todayString();
  const visible = todos.filter((todo) => filter === "all" || todo.status === filter).toSorted(compareTodos);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <SelectTrigger className="w-32" aria-label="進捗で絞り込む">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TodoFormDialog mode="create" user={user} userTags={userTags}>
          <Button>
            <PlusIcon />
            Todo を追加
          </Button>
        </TodoFormDialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タスク名</TableHead>
              <TableHead className="w-20">締め切り</TableHead>
              <TableHead className="w-32">進捗</TableHead>
              <TableHead>タグ</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {todos.length === 0 ? "Todo はまだありません。" : "条件に合う Todo はありません。"}
                </TableCell>
              </TableRow>
            ) : (
              visible.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell className={cn("font-medium", todo.status === "done" && "text-muted-foreground line-through")}>
                    {todo.title}
                  </TableCell>
                  <TableCell className={cn(isOverdue(todo, today) && "font-medium text-destructive")}>
                    {formatDueDate(todo.dueDate)}
                  </TableCell>
                  <TableCell>
                    <StatusCell todo={todo} />
                  </TableCell>
                  <TableCell>
                    <TodoTags todo={todo} userTags={userTags} />
                  </TableCell>
                  <TableCell>
                    <TodoRowActions todo={todo} userTags={userTags} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
