import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post } from "@nestjs/common";
import {
  AddTagRequestSchema,
  CreateTodoRequestSchema,
  UpdateTodoRequestSchema,
  type AddTagRequest,
  type CreateTodoRequest,
  type UpdateTodoRequest,
} from "@todo/types";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { TodosService } from "./todos.service.js";

@Controller(":user/todos")
export class TodoController {
  constructor(private readonly todoService: TodosService) {}

  @Get()
  findAll(@Param("user") user: string) {
    return this.todoService.findAll(user);
  }

  @Post()
  create(@Param("user") user: string, @Body(new ZodValidationPipe(CreateTodoRequestSchema)) body: CreateTodoRequest) {
    return this.todoService.create(user, body);
  }

  @Patch(":id")
  update(
    @Param("user") user: string,
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(UpdateTodoRequestSchema)) body: UpdateTodoRequest,
  ) {
    return this.todoService.update(user, id, body);
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("user") user: string, @Param("id", ParseIntPipe) id: number) {
    return this.todoService.remove(user, id);
  }

  @Post(":id/tags")
  addTag(
    @Param("user") user: string,
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(AddTagRequestSchema)) body: AddTagRequest,
  ) {
    return this.todoService.addTag(user, id, body.name);
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
