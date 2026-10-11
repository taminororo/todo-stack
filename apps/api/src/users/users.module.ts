import { Module } from "@nestjs/common";
import { UsersService } from "./users.service.js";
import { UserController } from "./users.controller.js";

@Module({
  controllers: [UserController],
  providers: [UsersService],
})
export class UsersModule {}
