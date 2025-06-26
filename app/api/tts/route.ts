import { NextRequest, NextResponse } from "next/server";
import * as googleTTS from "google-tts-api";

export async function POST(req: NextRequest) {
  const { text, language } = await req.json();

  if (!text) return NextResponse.json({ error: "텍스트가 없습니다." }, { status: 400 });

  const url = googleTTS.getAudioUrl(text, {
    lang: language || "ko-KR",
    slow: false,
    host: "https://translate.google.com",
  });

  return NextResponse.json({ audioUrl: url });
}
