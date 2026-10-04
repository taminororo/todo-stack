import { Module } from '@nestjs/common';
import { TodosService } from './todos.service.js';
import { TodoController } from './todos.controller.js';

@Module({
  controllers: [TodoController],
  providers: [TodosService],
})
export class TodosModule {}
