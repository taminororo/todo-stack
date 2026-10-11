"use client";

import { useState, type ReactNode } from "react";
import { TagNameSchema } from "@todo/types";
import { PlusIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// 既存タグから選ぶか、入力した名前で新しく作る。どちらも onSelect(name) を呼ぶ。
export function TagCombobox({
  candidates,
  onSelect,
  children,
}: {
  candidates: string[];
  onSelect: (name: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  // API と同じ条件（1〜30 文字）を満たす名前だけ、新しく作れる
  const canCreate = TagNameSchema.safeParse(trimmed).success && !candidates.includes(trimmed);

  function select(name: string) {
    onSelect(name);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="タグを検索・作成" value={query} onValueChange={setQuery} />
          <CommandList>
            <CommandEmpty>タグがありません</CommandEmpty>
            {candidates.length > 0 && (
              <CommandGroup heading="既存のタグ">
                {candidates.map((name) => (
                  <CommandItem key={name} value={name} onSelect={() => select(name)}>
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {canCreate && (
              <CommandGroup forceMount>
                <CommandItem value={`__create__${trimmed}`} onSelect={() => select(trimmed)} forceMount>
                  <PlusIcon />「{trimmed}」を作成
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
