import { Module } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { TodoController } from './todos.controller.js';
import { TagController } from './tags.controller.js';

@Module({
  controllers: [TodoController, TagController],
  providers: [TodosService],
})
export class TodosModule {}
