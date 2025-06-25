// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ 논문 팟캐스트 생성</h1>
      <p>
        👉 <Link href="/generate" className="text-blue-500 underline">/generate 페이지로 이동</Link>
      </p>
    </main>
  );
}
