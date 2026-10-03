import type { CreateTodoRequest, TodoStatus } from "@todo/types";

// DTO (Data Transfer Object): POST /todos のリクエストボディの形。
// implements で、packages/types の CreateTodoRequest と形がずれていないことを型チェックさせる。
// interface ではなく class なのは、あとでバリデーション用のデコレーターを付けるため
// （interface は実行時に消えるので、デコレーターを付けられない）。
export class CreateTodoDto implements CreateTodoRequest {
  title: string;
  status: TodoStatus;
}
