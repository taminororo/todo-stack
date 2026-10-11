import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

// ブラウザでは lib/api.ts が "/api/..." に送る。Node の fetch は相対 URL を解決できないので、
// jsdom の location（http://localhost:3000 相当）を基準に絶対 URL へ直す。
const nodeFetch = globalThis.fetch;
globalThis.fetch = (input, init) =>
  nodeFetch(typeof input === "string" ? new URL(input, window.location.origin) : input, init);

// Radix（Select / Popover）と cmdk が使うが、jsdom にない API
window.HTMLElement.prototype.scrollIntoView = function () {};
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.releasePointerCapture = () => {};
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 未定義のリクエストは失敗させ、ハンドラの書き忘れに気づけるようにする
beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  // sonner の toast はモジュール内の1つのストアに残るので、次のテストに持ち越さない
  toast.dismiss();
});
afterAll(() => server.close());

// sonner と next-themes が読む
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;
