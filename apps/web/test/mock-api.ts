import { http, HttpResponse } from "msw";
import type { CreateTodoRequest, Tag, Todo, UpdateTodoRequest } from "@todo/types";
import { server } from "./server";

// /api/:user/... をメモリ上の配列で再現する。書き込むと次の GET に反映されるので、
// 「保存 → invalidate → 取り直し」の流れまで通しで確かめられる。
export function mockApi({ todos: initial = [], tags: initialTags = [] }: { todos?: Todo[]; tags?: Tag[] } = {}) {
  let todos = structuredClone(initial);
  let tags = structuredClone(initialTags);
  const requests: { method: string; path: string; body: unknown }[] = [];

  async function record(request: Request) {
    const body = request.method === "GET" || request.method === "DELETE" ? undefined : await request.clone().json();
    requests.push({ method: request.method, path: new URL(request.url).pathname, body });
  }

  function findTag(name: string) {
    let tag = tags.find((t) => t.name === name);
    if (!tag) {
      tag = { id: Math.max(0, ...tags.map((t) => t.id)) + 1, name };
      tags = [...tags, tag];
    }
    return tag;
  }

  server.use(
    http.all("/api/*", async ({ request }) => {
      await record(request);
    }),
    http.get("/api/:user/todos", ({ params }) => HttpResponse.json(todos.filter((t) => t.owner === params.user))),
    http.get("/api/:user/tags", () => HttpResponse.json(tags)),
    http.post("/api/:user/todos", async ({ request, params }) => {
      const body = (await request.json()) as CreateTodoRequest;
      const todo: Todo = {
        id: Math.max(0, ...todos.map((t) => t.id)) + 1,
        title: body.title,
        dueDate: body.dueDate ?? null,
        status: body.status ?? "todo",
        tags: (body.tags ?? []).map(findTag),
        owner: String(params.user),
      };
      todos = [...todos, todo];
      return HttpResponse.json(todo, { status: 201 });
    }),
    http.patch("/api/:user/todos/:id", async ({ request, params }) => {
      const changes = (await request.json()) as UpdateTodoRequest;
      todos = todos.map((t) => (t.id === Number(params.id) ? { ...t, ...changes } : t));
      return HttpResponse.json(todos.find((t) => t.id === Number(params.id)));
    }),
    http.delete("/api/:user/todos/:id", ({ params }) => {
      todos = todos.filter((t) => t.id !== Number(params.id));
      return new HttpResponse(null, { status: 204 });
    }),
    http.post("/api/:user/todos/:id/tags", async ({ request, params }) => {
      const { name } = (await request.json()) as { name: string };
      const tag = findTag(name);
      todos = todos.map((t) => (t.id === Number(params.id) ? { ...t, tags: [...t.tags, tag] } : t));
      return HttpResponse.json(todos.find((t) => t.id === Number(params.id)), { status: 201 });
    }),
    http.delete("/api/:user/todos/:id/tags/:tagId", ({ params }) => {
      todos = todos.map((t) =>
        t.id === Number(params.id) ? { ...t, tags: t.tags.filter((tag) => tag.id !== Number(params.tagId)) } : t,
      );
      return new HttpResponse(null, { status: 204 });
    }),
  );

  return { requests, todos: () => todos };
}
