import { Controller, Get, Param } from "@nestjs/common";
import { TodosService } from "./todos.service.js";

// パスの先頭は :user（例: /taro/todos）。@Param("user") で、その名前を受け取る。
@Controller(":user/todos")
export class TodoController {
  constructor(private readonly todoService: TodosService) {}

  @Get()
  findAll(@Param("user") user: string) {
    return this.todoService.findAll(user);
  }
}
