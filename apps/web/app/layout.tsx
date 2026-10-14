import type { ReactNode } from "react";
import { Geist } from "next/font/google";
import { Toaster } from "@todo/ui/components/sonner";
import { cn } from "@todo/ui/lib/utils";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = { title: "todo-stack" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={cn("font-sans", geist.variable)}>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
