import { setupServer } from "msw/node";

// ハンドラはテストごとに server.use(...) で足す
export const server = setupServer();
