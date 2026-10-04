import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "todo-stack" };

// 全ページ共通の外枠。page.tsx の中身が children に入る。
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
