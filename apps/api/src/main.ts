// アプリの入口。AppModule を起点に、Nest が全部の部品を組み立ててから HTTP サーバーを起動する。
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
// ESM なので import には .js を付ける（ビルド後の dist/app.module.js を指すため）
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // すべてのリクエストで、@Body() などの DTO をデコレーターのルールで検証する。
  // 違反があれば controller のメソッドが呼ばれる前に 400 を返す。
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO にデコレーターがないフィールドは取り除く
      forbidNonWhitelisted: true, // 取り除くだけでなく、400 にする
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
