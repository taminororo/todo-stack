import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { CreateTodoRequest, Tag, Todo, UpdateTodoRequest } from "@todo/types";
import { PrismaService } from "../prisma/prisma.service.js";

// Todo を返すときに一緒に読むもの。toTodo() はこの形の行を受け取る
const todoInclude = { owner: true, todoTags: { include: { tag: true } } } satisfies Prisma.TodoInclude;
type TodoRow = Prisma.TodoGetPayload<{ include: typeof todoInclude }>;

function toTodo(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    dueDate: row.dueDate ? row.dueDate.toISOString().slice(0, 10) : null,
    status: row.status,
    tags: row.todoTags.map((todoTag) => ({ id: todoTag.tag.id, name: todoTag.tag.name })),
    owner: row.owner.name,
  };
}

// "2026-08-31" → その日の UTC 0時。due_date は date 型なので時刻は捨てられる
const toDueDate = (dueDate: string | null | undefined) =>
  dueDate === undefined ? undefined : dueDate === null ? null : new Date(dueDate);

// タグ名からタグを取り出す。そのユーザーにまだなければ作る
const connectOrCreateTag = (ownerId: number, name: string) => ({
  connectOrCreate: {
    where: { ownerId_name: { ownerId, name } },
    create: { name, ownerId },
  },
});

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userName: string): Promise<Todo[]> {
    const user = await this.findUser(userName);
    const rows = await this.prisma.todo.findMany({
      where: { ownerId: user.id },
      include: todoInclude,
      orderBy: { id: "asc" },
    });
    return rows.map(toTodo);
  }

  async create(userName: string, dto: CreateTodoRequest): Promise<Todo> {
    const user = await this.findUser(userName);
    const tagNames = [...new Set((dto.tags ?? []).map((name) => name.trim()))];
    const row = await this.prisma.todo.create({
      data: {
        title: dto.title,
        dueDate: toDueDate(dto.dueDate),
        status: dto.status,
        ownerId: user.id,
        todoTags: { create: tagNames.map((name) => ({ tag: connectOrCreateTag(user.id, name) })) },
      },
      include: todoInclude,
    });
    return toTodo(row);
  }

  async update(userName: string, id: number, dto: UpdateTodoRequest): Promise<Todo> {
    await this.findOwnTodo(userName, id);
    const row = await this.prisma.todo.update({
      where: { id },
      data: { title: dto.title, dueDate: toDueDate(dto.dueDate), status: dto.status },
      include: todoInclude,
    });
    return toTodo(row);
  }

  async remove(userName: string, id: number): Promise<void> {
    await this.findOwnTodo(userName, id);
    await this.prisma.todo.delete({ where: { id } }); // todo_tags は onDelete: Cascade で一緒に消える
  }

  async addTag(userName: string, id: number, name: string): Promise<Todo> {
    const todo = await this.findOwnTodo(userName, id);
    const tag = await this.prisma.tag.upsert({
      where: { ownerId_name: { ownerId: todo.ownerId, name: name.trim() } },
      update: {},
      create: { name: name.trim(), ownerId: todo.ownerId },
    });
    // もう付いているタグをもう一度付けても、エラーにせずそのまま返す
    const row = await this.prisma.todo.update({
      where: { id },
      data: {
        todoTags: {
          upsert: {
            where: { todoId_tagId: { todoId: id, tagId: tag.id } },
            update: {},
            create: { tagId: tag.id },
          },
        },
      },
      include: todoInclude,
    });
    return toTodo(row);
  }

  async removeTag(userName: string, id: number, tagId: number): Promise<void> {
    await this.findOwnTodo(userName, id);
    await this.prisma.todoTag.deleteMany({ where: { todoId: id, tagId } });
  }

  async findTags(userName: string): Promise<Tag[]> {
    const user = await this.findUser(userName);
    return this.prisma.tag.findMany({
      where: { ownerId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  }

  private async findUser(userName: string) {
    const user = await this.prisma.user.findUnique({ where: { name: userName } });
    if (!user) throw new NotFoundException(`User ${userName} not found`);
    return user;
  }

  // ほかのユーザーの Todo は、存在していても 404 にする
  private async findOwnTodo(userName: string, id: number) {
    const user = await this.findUser(userName);
    const todo = await this.prisma.todo.findFirst({ where: { id, ownerId: user.id } });
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    return todo;
  }
}
