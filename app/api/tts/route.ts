import { NextRequest, NextResponse } from "next/server";
import googleTTS from "google-tts-api";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const { text, language } = await req.json();
  const url = googleTTS.getAudioUrl(text, { lang: language, slow: false });
  const audioBuffer = await fetch(url).then(res => res.arrayBuffer());
  const fileName = `${uuidv4()}.mp3`;
  const filePath = path.join("/tmp", fileName);
  fs.writeFileSync(filePath, Buffer.from(audioBuffer));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.json({ audioUrl: `${baseUrl}/api/tts/audio?file=${fileName}` });
}
