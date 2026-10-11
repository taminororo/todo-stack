import { TODO_STATUSES, type CreateTodoRequest, type TodoStatus } from "@todo/types";
import { ArrayMaxSize, IsArray, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from "class-validator";

export class CreateTodoDto implements CreateTodoRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  // "2026-08-31" の形だけ受け付ける。null は「締め切りなし」として通す
  @IsOptional()
  @IsISO8601({ strict: true, strictSeparator: true })
  @MaxLength(10)
  dueDate?: string | null;

  @IsOptional()
  @IsIn(TODO_STATUSES)
  status?: TodoStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MaxLength(30, { each: true })
  @Matches(/\S/, { each: true, message: "each value in tags must not be blank" })
  tags?: string[];
}
