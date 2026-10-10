import { Controller, Get, Param } from "@nestjs/common";
import { TodosService } from "./todos.service.js";

@Controller(":user/todos")
export class TodoController {
  constructor(private readonly todoService: TodosService) {}

  @Get()
  findAll(@Param("user") user: string) {
    return this.todoService.findAll(user);
  }
}
