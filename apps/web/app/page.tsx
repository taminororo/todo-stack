import Link from "next/link";

// GET / : ユーザーを URL に入れて開く作りなので、いまは taro へのリンクだけ置く。
export default function HomePage() {
  return (
    <main>
      <h1>todo-stack</h1>
      <p>
        <Link href="/taro">taro の Todo を見る</Link>
      </p>
    </main>
  );
}
