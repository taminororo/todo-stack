import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service.js";

// Controller: HTTP のルートと、メソッドを対応づける係。仕事そのものは service に任せる。
@Controller() // 引数なし = パスの先頭は "/"
export class AppController {
  // DI: new AppService() とは書かない。「AppService が欲しい」と引数で宣言するだけで、
  // Nest が AppModule の providers から探して渡してくれる。
  constructor(private readonly appService: AppService) {}

  @Get() // GET / が来たら、このメソッドが呼ばれる
  getHello(): string {
    return this.appService.getHello();
  }
}
