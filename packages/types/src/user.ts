export interface User {
  id: number;
  name: string; // URL の /:user に入る名前。例: "taro"
}

// POST /users: ユーザーを1人作る。作ったユーザー（User）を返す。
// name は文字・数字・"_"・"-" だけで 30 文字まで。"api" は Web の /api と重なるので使えない。
// 同じ名前のユーザーがもういれば 409 を返す。
export interface CreateUserRequest {
  name: string;
}

// GET /users: ユーザーの一覧（User[]）を名前順で返す。
