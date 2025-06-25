import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  // TODO: 실제로는 ID를 기반으로 논문 전문 받아와서 요약 (예: OpenAI GPT API 사용)
  return NextResponse.json({
    summary: `이 논문은 ${id}에 대한 연구 결과를 다룹니다.`
  });
}
