import { Injectable, NotFoundException } from "@nestjs/common";
import type { Todo } from "@todo/types";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userName: string): Promise<Todo[]> {
    const user = await this.prisma.user.findUnique({ where: { name: userName } });
    if (!user) throw new NotFoundException(`User ${userName} not found`);

    const rows = await this.prisma.todo.findMany({
      where: { ownerId: user.id },
      include: { owner: true, todoTags: { include: { tag: true } } },
      orderBy: { id: "asc" },
    });

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
