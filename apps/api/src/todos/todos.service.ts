import { Injectable, NotFoundException } from "@nestjs/common";
import type { Todo } from "@todo/types";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /:user/todos: そのユーザーの Todo の一覧を、画面に出す形（Todo[]）にして返す。
  async findAll(userName: string): Promise<Todo[]> {
    // ユーザーが DB にいなければ 404。空の一覧を返すと、「いない」と「Todo が 0 件」が区別できない。
    const user = await this.prisma.user.findUnique({ where: { name: userName } });
    if (!user) throw new NotFoundException(`User ${userName} not found`);

    // include: 関連するテーブルも一緒に読む。todos、users、todo_tags、tags を結合した結果になる。
    const rows = await this.prisma.todo.findMany({
      where: { ownerId: user.id },
      include: { owner: true, todoTags: { include: { tag: true } } },
      orderBy: { id: "asc" },
    });

    // DB の行の形を、packages/types の Todo の形に組み立て直す。
    return rows.map((row) =>  ({
      id: row.id,
      title: row.title,
      dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
      status: row.status,
      tags: row.todoTags.map((todoTag) => ({ id: todoTag.tag.id, name: todoTag.tag.name })),
      owner: row.owner.name,
    }))
  }
}
