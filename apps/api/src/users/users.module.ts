import { Module } from "@nestjs/common";
import { UserController } from "./users.controller.js";
import { UsersService } from "./users.service.js";

@Module({
	controllers: [UserController],
	providers: [UsersService],
})
export class UsersModule {}
