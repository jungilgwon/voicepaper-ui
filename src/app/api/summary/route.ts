// src/app/api/summary/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || "";

  const summaries: Record<string, string> = {
    paper1: "이 논문은 DNA의 이중 나선 구조를 다룹니다.",
    paper2: "이 논문은 DNA와 RNA의 차이점을 분석합니다.",
  };

  return NextResponse.json({ summary: summaries[id] || "해당 논문 요약이 없습니다." });
}
