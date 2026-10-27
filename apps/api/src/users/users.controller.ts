import { Body, Controller, Get, Post } from "@nestjs/common";
import { type CreateUserRequest, CreateUserRequestSchema } from "@todo/types";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { UsersService } from "./users.service.js";

@Controller("users")
export class UserController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	findAll() {
		return this.usersService.findAll();
	}

	@Post()
	create(
		@Body(new ZodValidationPipe(CreateUserRequestSchema))
		body: CreateUserRequest,
	) {
		return this.usersService.create(body.name);
	}
}
