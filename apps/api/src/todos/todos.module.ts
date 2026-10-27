import { Module } from "@nestjs/common";
import { TagController } from "./tags.controller.js";
import { TodoController } from "./todos.controller.js";
import { TodosService } from "./todos.service.js";

@Module({
	controllers: [TodoController, TagController],
	providers: [TodosService],
})
export class TodosModule {}
