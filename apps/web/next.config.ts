import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
	// packages/ui・api-client・api-hooks はビルドせず TS のソースで配る。Next 側でコンパイルする
	transpilePackages: ["@todo/ui", "@todo/api-client", "@todo/api-hooks"],
	// ブラウザ（TanStack Query）からの /api/* を API サーバーへ中継する
	async rewrites() {
		return [{ source: "/api/:path*", destination: `${API_URL}/:path*` }];
	},
};

export default nextConfig;
