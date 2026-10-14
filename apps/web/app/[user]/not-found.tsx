import Link from "next/link";
import { Button } from "@todo/ui/components/button";

export default function UserNotFound() {
  return (
    <main className="mx-auto grid max-w-md justify-items-center gap-4 px-4 py-20 text-center">
      <h1 className="text-xl font-semibold">ユーザーが見つかりません</h1>
      <p className="text-muted-foreground">名前が正しいか確かめてください。</p>
      <Button variant="outline" asChild>
        <Link href="/">トップに戻る</Link>
      </Button>
    </main>
  );
}
