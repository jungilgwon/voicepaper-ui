// src/app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('keyword') || '';

  const dummyResults = [
    { id: 'paper1', title: `DNA 구조 분석 논문 1` },
    { id: 'paper2', title: `DNA와 RNA 비교 연구 2` },
  ];

  const filtered = dummyResults.filter(paper => paper.title.toLowerCase().includes(keyword.toLowerCase()));

  return NextResponse.json({ papers: filtered });
}
