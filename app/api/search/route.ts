import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "논문";

  // 최대 20개까지 더미 논문 생성
  const papers = Array.from({ length: 20 }, (_, i) => ({
    id: `paper${i + 1}`,
    title: `${keyword} 논문 ${i + 1}`,
  }));

  return NextResponse.json({ papers });
}
