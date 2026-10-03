import { Injectable, NotFoundException } from "@nestjs/common";
import type { Todo } from "@todo/types";
import { CreateTodoDto } from "./dto/create-todo.dto.js";
import { UpdateTodoDto } from "./dto/update-todo.dto.js";

// まずは DB なしで、メモリ上の配列に保存する。
// サーバーを再起動すると消える。あとで中身だけを Prisma に差し替える。
@Injectable()
export class TodosService {
  private todos: Todo[] = [];
  private nextId = 1; // Postgres のシーケンスの代わり

  create(dto: CreateTodoDto): Todo {
    const todo: Todo = { id: this.nextId++, ...dto };
    this.todos.push(todo);
    return todo;
  }

  findAll(): Todo[] {
    return this.todos;
  }

  // 見つからなければ NotFoundException を投げる。Nest がそれを 404 のレスポンスに変換する。
  findOne(id: number): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) throw new NotFoundException(`Todo ${id} not found`);
    return todo;
  }

  // findOne を再利用するので、存在しない id なら update も自動で 404 になる。
  update(id: number, dto: UpdateTodoDto): Todo {
    const todo = this.findOne(id);
    Object.assign(todo, dto); // dto に含まれるフィールドだけを上書きする
    return todo;
  }

  remove(id: number): Todo {
    const todo = this.findOne(id);
    this.todos = this.todos.filter((t) => t.id !== id);
    return todo;
  }
}
