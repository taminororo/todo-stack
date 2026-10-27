import { ConflictException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { User } from "@todo/types";
import type { PrismaService } from "../prisma/prisma.service.js";

const userSelect = { id: true, name: true } satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
	constructor(private readonly prisma: PrismaService) {}

	findAll(): Promise<User[]> {
		return this.prisma.user.findMany({
			select: userSelect,
			orderBy: { name: "asc" },
		});
	}

	async create(name: string): Promise<User> {
		// 先に findUnique で確かめると、その間に同じ名前で作られうる。作ってみて、一意制約の違反（P2002）を 409 にする。
		// await しないと、失敗が try を抜けたあとで起き、catch に入らない
		try {
			return await this.prisma.user.create({
				data: { name },
				select: userSelect,
			});
		} catch (e) {
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002"
			) {
				throw new ConflictException(`User "${name}" already exists`);
			}
			throw e;
		}
	}
}
