import type { CreateUserRequest } from "@todo/types";
import { IsNotIn, IsString, Matches, MaxLength } from "class-validator";

export class CreateUserDto implements CreateUserRequest {
  // name はそのまま URL の /:user になるので、区切り文字や空白を含まない形だけ受け付ける
  @IsString()
  @MaxLength(30)
  @Matches(/^[\p{L}\p{N}_-]+$/u, { message: "name may only contain letters, numbers, _ and -" })
  // Web の /api/* は API への中継に使っているので、この名前のページは開けない
  @IsNotIn(["api"])
  name: string;
}
