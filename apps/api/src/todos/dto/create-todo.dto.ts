import type { CreateTodoRequest, TodoStatus } from "@todo/types";
import { IsIn, IsNotEmpty, IsString, MaxLength } from "class-validator";

// DTO (Data Transfer Object): POST /todos のリクエストボディの形。
// implements で、packages/types の CreateTodoRequest と形がずれていないことを型チェックさせる。
// interface ではなく class なのは、バリデーション用のデコレーターを付けるため
// （interface は実行時に消えるので、デコレーターを付けられない）。
//
// 型（: string）はコンパイル時の約束、デコレーターは実行時のチェック。両方が必要。
export class CreateTodoDto implements CreateTodoRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  // TodoStatus は型なので実行時には存在しない。許可する値を配列で書いて渡す。
  @IsIn(["todo", "doing", "done"])
  status: TodoStatus;
}
