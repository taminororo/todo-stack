import type { CreateTodoRequest, TodoStatus } from "@todo/types";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";
export class CreateTodoDto implements CreateTodoRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsIn(["todo", "doing", "done"])
  status: TodoStatus;
}
