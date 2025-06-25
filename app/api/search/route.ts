import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") || "";

  const dummyPapers = Array.from({ length: 20 }, (_, i) => ({
    id: `arxiv-${i}`,
    title: `${keyword} 관련 논문 ${i + 1}`,
  }));

  return NextResponse.json({ papers: dummyPapers });
}
