"use client";

import type { Tag, Todo } from "@todo/types";
import { PlusIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAddTag, useRemoveTag } from "@/lib/query/todos";
import { TagCombobox } from "./tag-combobox";

// 1行ぶんのタグ。× で外し、+ で付ける（POST/DELETE /:user/todos/:id/tags）。
export function TodoTags({ todo, userTags }: { todo: Todo; userTags: Tag[] }) {
  const addTag = useAddTag(todo.owner);
  const removeTag = useRemoveTag(todo.owner);
  const pending = addTag.isPending || removeTag.isPending;
  const attached = new Set(todo.tags.map((tag) => tag.name));
  const candidates = userTags.map((tag) => tag.name).filter((name) => !attached.has(name));

  return (
    <div className="flex flex-wrap items-center gap-1" aria-busy={pending}>
      {todo.tags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="gap-0.5 pr-0.5">
          {tag.name}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-foreground/10 disabled:opacity-50"
            aria-label={`タグ「${tag.name}」を外す`}
            disabled={pending}
            onClick={() => removeTag.mutate({ id: todo.id, tagId: tag.id })}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <TagCombobox candidates={candidates} onSelect={(name) => addTag.mutate({ id: todo.id, name })}>
        <Button variant="ghost" size="icon-xs" aria-label="タグを付ける" disabled={pending}>
          <PlusIcon />
        </Button>
      </TagCombobox>
    </div>
  );
}
