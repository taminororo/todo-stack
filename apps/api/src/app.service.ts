import { Injectable } from "@nestjs/common";

// Service: 実際の仕事をする係。あとでここが Prisma と話すようになる。
// @Injectable() = 「Nest が作って、他のクラスに渡してよい部品」という印。
@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
