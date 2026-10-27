import { screen, waitFor, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { makeTodo, tags } from "@/test/fixtures";
import { mockApi } from "@/test/mock-api";
import { renderWithClient } from "@/test/render";
import { server } from "@/test/server";
import { TodoBoard } from "./todo-board";

// tbody の行を、上から順にタスク名だけ取り出す
function rowTitles() {
	const [, ...bodyRows] = screen.getAllByRole("row");
	return bodyRows.map((row) => within(row).getAllByRole("cell")[0].textContent);
}

function rowOf(title: string) {
	return screen.getByRole("row", { name: new RegExp(title) });
}

describe("TodoBoard", () => {
	it("API から取った Todo を、進行中 → 未着手 → 完了、締め切りの早い順に並べる", async () => {
		mockApi({
			todos: [
				makeTodo({
					id: 1,
					title: "完了したもの",
					status: "done",
					dueDate: "2026-01-01",
				}),
				makeTodo({ id: 2, title: "締め切りなし", status: "todo" }),
				makeTodo({
					id: 3,
					title: "早い締め切り",
					status: "todo",
					dueDate: "2026-09-01",
				}),
				makeTodo({
					id: 4,
					title: "手を付けている",
					status: "doing",
					dueDate: "2026-12-31",
				}),
			],
		});
		renderWithClient(<TodoBoard user="taro" />);

		expect(await screen.findByText("手を付けている")).toBeInTheDocument();
		expect(rowTitles()).toEqual([
			"手を付けている",
			"早い締め切り",
			"締め切りなし",
			"完了したもの",
		]);
	});

	it("Todo が1件もないときは、そう表示する", async () => {
		mockApi();
		renderWithClient(<TodoBoard user="taro" />);

		expect(
			await screen.findByText("Todo はまだありません。"),
		).toBeInTheDocument();
	});

	it("進捗で絞り込める", async () => {
		mockApi({
			todos: [
				makeTodo({ id: 1, title: "A", status: "todo" }),
				makeTodo({ id: 2, title: "B", status: "done" }),
			],
		});
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(screen.getByRole("combobox", { name: "進捗で絞り込む" }));
		await user.click(screen.getByRole("option", { name: "完了" }));

		expect(rowTitles()).toEqual(["B"]);
	});

	it("進捗を変えると PATCH を送り、取り直した結果で並びが変わる", async () => {
		const api = mockApi({
			todos: [
				makeTodo({ id: 1, title: "A", status: "todo" }),
				makeTodo({ id: 2, title: "B", status: "todo" }),
			],
		});
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(
			within(rowOf("B")).getByRole("combobox", { name: "進捗" }),
		);
		await user.click(screen.getByRole("option", { name: "進行中" }));

		await waitFor(() => expect(rowTitles()).toEqual(["B", "A"]));
		expect(api.requests).toContainEqual({
			method: "PATCH",
			path: "/api/taro/todos/2",
			body: { status: "doing" },
		});
	});

	it("進捗を変えると、API の応答を待たずに並びが変わる（楽観的更新）", async () => {
		mockApi({
			todos: [
				makeTodo({ id: 1, title: "A", status: "todo" }),
				makeTodo({ id: 2, title: "B", status: "todo" }),
			],
		});
		// PATCH の応答を止めておき、応答前の画面を確かめる
		let respond!: () => void;
		const responded = new Promise<void>((resolve) => (respond = resolve));
		server.use(
			http.patch("/api/:user/todos/:id", async () => {
				await responded;
				return HttpResponse.json(
					makeTodo({ id: 2, title: "B", status: "doing" }),
				);
			}),
		);
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(
			within(rowOf("B")).getByRole("combobox", { name: "進捗" }),
		);
		await user.click(screen.getByRole("option", { name: "進行中" }));

		await waitFor(() => expect(rowTitles()).toEqual(["B", "A"]));
		respond();
	});

	it("進捗の保存に失敗したら、元の並びに戻して toast で知らせる", async () => {
		mockApi({
			todos: [
				makeTodo({ id: 1, title: "A", status: "todo" }),
				makeTodo({ id: 2, title: "B", status: "todo" }),
			],
		});
		server.use(
			http.patch(
				"/api/:user/todos/:id",
				() => new HttpResponse(null, { status: 500 }),
			),
		);
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(
			within(rowOf("B")).getByRole("combobox", { name: "進捗" }),
		);
		await user.click(screen.getByRole("option", { name: "進行中" }));

		expect(await screen.findByText("保存できませんでした")).toBeInTheDocument();
		expect(rowTitles()).toEqual(["A", "B"]);
	});

	it("削除は確認してから行い、一覧から消える", async () => {
		const api = mockApi({
			todos: [makeTodo({ id: 1, title: "A" }), makeTodo({ id: 2, title: "B" })],
		});
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(
			within(rowOf("A")).getByRole("button", { name: "その他の操作" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "削除" }));
		const dialog = screen.getByRole("alertdialog", {
			name: "「A」を削除しますか？",
		});
		await user.click(within(dialog).getByRole("button", { name: "削除" }));

		await waitFor(() =>
			expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
		);
		expect(rowTitles()).toEqual(["B"]);
		expect(api.todos().map((t) => t.id)).toEqual([2]);
	});

	it("追加フォームから、タグ付きで Todo を作れる", async () => {
		const api = mockApi({ tags });
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("Todo はまだありません。");

		await user.click(screen.getByRole("button", { name: "Todo を追加" }));
		const dialog = screen.getByRole("dialog", { name: "Todo を追加" });
		await user.type(within(dialog).getByLabelText("タスク名"), "  卵を買う  ");
		await user.click(within(dialog).getByRole("button", { name: "タグ" }));
		await user.click(screen.getByRole("option", { name: "買い物" }));
		await user.click(within(dialog).getByRole("button", { name: "追加" }));

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(within(rowOf("卵を買う")).getByText("買い物")).toBeInTheDocument();
		expect(api.requests).toContainEqual({
			method: "POST",
			path: "/api/taro/todos",
			body: {
				title: "卵を買う",
				dueDate: null,
				status: "todo",
				tags: ["買い物"],
			},
		});
	});

	it("編集では、変えたフィールドだけを送る", async () => {
		const api = mockApi({
			todos: [makeTodo({ id: 1, title: "A", dueDate: "2026-10-20" })],
		});
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(within(rowOf("A")).getByRole("button", { name: "編集" }));
		const dialog = screen.getByRole("dialog", { name: "Todo を編集" });
		const title = within(dialog).getByLabelText("タスク名");
		await user.clear(title);
		await user.type(title, "A2");
		await user.click(within(dialog).getByRole("button", { name: "保存" }));

		expect(await screen.findByText("A2")).toBeInTheDocument();
		expect(api.requests.filter((r) => r.method === "PATCH")).toEqual([
			{ method: "PATCH", path: "/api/taro/todos/1", body: { title: "A2" } },
		]);
	});

	it("タグの × でタグを外せる", async () => {
		mockApi({ todos: [makeTodo({ id: 1, title: "A", tags })], tags });
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(
			screen.getByRole("button", { name: "タグ「仕事」を外す" }),
		);

		await waitFor(() =>
			expect(within(rowOf("A")).queryByText("仕事")).not.toBeInTheDocument(),
		);
		expect(within(rowOf("A")).getByText("買い物")).toBeInTheDocument();
	});

	it("保存に失敗したら toast で知らせ、ダイアログは開いたままにする", async () => {
		mockApi({ todos: [makeTodo({ id: 1, title: "A" })] });
		server.use(
			http.post(
				"/api/:user/todos",
				() => new HttpResponse(null, { status: 400 }),
			),
		);
		const { user } = renderWithClient(<TodoBoard user="taro" />);
		await screen.findByText("A");

		await user.click(screen.getByRole("button", { name: "Todo を追加" }));
		await user.type(screen.getByLabelText("タスク名"), "B");
		await user.click(screen.getByRole("button", { name: "追加" }));

		expect(await screen.findByText("保存できませんでした")).toBeInTheDocument();
		expect(
			screen.getByRole("dialog", { name: "Todo を追加" }),
		).toBeInTheDocument();
	});

	it("一覧の取得に失敗したら、エラーを表示する", async () => {
		// server.use は後から足したハンドラが優先されるので、mockApi のあとに上書きする
		mockApi();
		server.use(
			http.get(
				"/api/:user/todos",
				() => new HttpResponse(null, { status: 500 }),
			),
		);
		renderWithClient(<TodoBoard user="taro" />);

		expect(
			await screen.findByText(/Todo を読み込めませんでした/),
		).toBeInTheDocument();
	});
});
