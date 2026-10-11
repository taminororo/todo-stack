import type { AddTagRequest } from "@todo/types";
import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class AddTagDto implements AddTagRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  @Matches(/\S/, { message: "name must not be blank" })
  name: string;
}
