import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text, style, speed } = await req.json();

  const speechUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text
  )}&tl=ko&client=tw-ob`;

  const response = await fetch(speechUrl);
  const audio = await response.arrayBuffer();

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.byteLength.toString(),
    },
  });
}
