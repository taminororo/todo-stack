// アプリの入口。AppModule を起点に、Nest が全部の部品を組み立ててから HTTP サーバーを起動する。
import { NestFactory } from "@nestjs/core";
// ESM なので import には .js を付ける（ビルド後の dist/app.module.js を指すため）
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
