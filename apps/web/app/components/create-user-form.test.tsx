import { screen, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithClient } from "@/test/render";
import { server } from "@/test/server";
import { CreateUserForm } from "./create-user-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

describe("CreateUserForm", () => {
	beforeEach(() => push.mockClear());

	it("POST /users で作り、作ったユーザーのページへ移る", async () => {
		let body: unknown;
		server.use(
			http.post("/api/users", async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({ id: 2, name: "hanako" }, { status: 201 });
			}),
		);
		const { user } = renderWithClient(<CreateUserForm />);

		await user.type(screen.getByLabelText("新しいユーザー"), " hanako ");
		await user.click(screen.getByRole("button", { name: "作成" }));
		await user.click(await screen.findByRole("button", { name: "はい" }));

		await waitFor(() => expect(push).toHaveBeenCalledWith("/hanako"));
		expect(body).toEqual({ name: "hanako" });
	});

	it("使えない名前のときは送らない", async () => {
		const { user } = renderWithClient(<CreateUserForm />);

		await user.type(screen.getByLabelText("新しいユーザー"), "a/b");

		expect(screen.getByRole("button", { name: "作成" })).toBeDisabled();
	});

	it("確認ダイアログで「はい」以外を選ぶと、作成しない", async () => {
		let called = false;
		server.use(
			http.post("/api/users", () => {
				called = true;
				return HttpResponse.json({ id: 2, name: "hanako" }, { status: 201 });
			}),
		);
		const { user } = renderWithClient(<CreateUserForm />);

		await user.type(screen.getByLabelText("新しいユーザー"), "hanako");
		await user.click(screen.getByRole("button", { name: "作成" }));
		await user.click(await screen.findByRole("button", { name: "キャンセル" }));

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(called).toBe(false);
		expect(push).not.toHaveBeenCalled();
	});

	it("409 が返ったら、名前が重なっていると知らせる", async () => {
		server.use(
			http.post("/api/users", () => new HttpResponse(null, { status: 409 })),
		);
		const { user } = renderWithClient(<CreateUserForm />);

		await user.type(screen.getByLabelText("新しいユーザー"), "taro");
		await user.click(screen.getByRole("button", { name: "作成" }));
		await user.click(await screen.findByRole("button", { name: "はい" }));

		expect(
			await screen.findByText("その名前のユーザーはもういます。"),
		).toBeInTheDocument();
		expect(push).not.toHaveBeenCalled();
	});
});
