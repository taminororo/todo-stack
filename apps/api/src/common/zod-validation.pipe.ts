import { BadRequestException, type PipeTransform } from "@nestjs/common";
import { z } from "zod";

// @Body(new ZodValidationPipe(schema)) のように使う。
// 通れば schema で整えた値（trim 済みなど）をハンドラーに渡し、通らなければ 400 を返す。
export class ZodValidationPipe<T extends z.ZodType>
	implements PipeTransform<unknown, z.output<T>>
{
	constructor(private readonly schema: T) {}

	transform(value: unknown): z.output<T> {
		const result = this.schema.safeParse(value);
		if (!result.success) throw toBadRequest(result.error);
		return result.data;
	}
}

// 検証に失敗したときに返す 400 の本体を作る。
// message は以前の ValidationPipe と同じく文字列の配列（人が読む用）。
// fieldErrors はプロパティごとのエラーで、Web のフォームで欄ごとに出すときに使える。
// 知らないプロパティのように特定の欄に属さないエラーは formErrors に入る
export function toBadRequest(error: z.ZodError): BadRequestException {
	const { formErrors, fieldErrors } = z.flattenError(error);
	return new BadRequestException({
		statusCode: 400,
		error: "Bad Request",
		message: error.issues.map((issue) =>
			issue.path.length
				? `${issue.path.join(".")}: ${issue.message}`
				: issue.message,
		),
		formErrors,
		fieldErrors,
	});
}
