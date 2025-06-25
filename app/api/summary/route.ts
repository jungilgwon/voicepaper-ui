import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";

  // 20개의 더미 요약 데이터를 생성
  const summaries: Record<string, string> = Object.fromEntries(
    Array.from({ length: 20 }, (_, i) => [
      `paper${i + 1}`,
      `이 논문은 ${i + 1}번째 주제에 대한 연구 결과를 다룹니다.`,
    ])
  );

  return NextResponse.json({
    summary: summaries[id] || "해당 논문 요약이 없습니다.",
  });
}
