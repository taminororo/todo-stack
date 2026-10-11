import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import { AddTagDto } from "./dto/add-tag.dto.js";
import { CreateTodoDto } from "./dto/create-todo.dto.js";
import { UpdateTodoDto } from "./dto/update-todo.dto.js";
import { TodosService } from "./todos.service.js";

@Controller(":user/todos")
export class TodoController {
  constructor(private readonly todoService: TodosService) {}

  @Get()
  findAll(@Param("user") user: string) {
    return this.todoService.findAll(user);
  }

  @Post()
  create(@Param("user") user: string, @Body() dto: CreateTodoDto) {
    return this.todoService.create(user, dto);
  }

  @Patch(":id")
  update(@Param("user") user: string, @Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todoService.update(user, id, dto);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("user") user: string, @Param("id", ParseIntPipe) id: number) {
    return this.todoService.remove(user, id);
  }

  @Post(":id/tags")
  addTag(@Param("user") user: string, @Param("id", ParseIntPipe) id: number, @Body() dto: AddTagDto) {
    return this.todoService.addTag(user, id, dto.name);
  }

  @Delete(":id/tags/:tagId")
  @HttpCode(204)
  removeTag(
    @Param("user") user: string,
    @Param("id", ParseIntPipe) id: number,
    @Param("tagId", ParseIntPipe) tagId: number,
  ) {
    return this.todoService.removeTag(user, id, tagId);
  }
}
