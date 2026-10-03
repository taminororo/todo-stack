import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { TodosModule } from './todos/todos.module.js';

// Module: 部品の一覧表。「この module には、どの controller と provider（service）があるか」を宣言する。
// Nest はこの一覧を見て、AppService を 1 つ作り、それを AppController に渡す（DI）。
@Module({
  imports: [TodosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
