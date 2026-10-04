import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";

// @Global: どの module からも、import し直さずに PrismaService を使えるようにする。
// DB の窓口はアプリ全体で 1 つだけ作りたいので、ここで 1 回だけ登録する。
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
