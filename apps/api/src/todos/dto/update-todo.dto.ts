import { OmitType, PartialType } from "@nestjs/mapped-types";
import type { UpdateTodoRequest } from "@todo/types";
import { CreateTodoDto } from "./create-todo.dto.js";

// タグは別のエンドポイントで操作するので、PATCH では受け付けない
export class UpdateTodoDto extends PartialType(OmitType(CreateTodoDto, ["tags"] as const)) implements UpdateTodoRequest {}
