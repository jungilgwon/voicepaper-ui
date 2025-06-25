import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const summaryText = `이 논문은 ${id}에 대한 연구 결과를 다룹니다.`;

  return NextResponse.json({ summary: summaryText });
}
