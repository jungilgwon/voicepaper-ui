import { NextResponse } from "next/server"; // 예시 구조 - 실제로는 클라우드 TTS API 연동 필요

export async function POST(req: Request) {
  const { text } = await req.json();
  // TODO: TTS 처리 → 오디오 생성
  return NextResponse.json({
    audioUrl: `/mock-tts/${encodeURIComponent(text)}.mp3`
  });
}
