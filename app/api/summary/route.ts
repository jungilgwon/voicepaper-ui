import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ summary: "잘못된 요청입니다." });

  const res = await fetch(`https://export.arxiv.org/api/query?id_list=${id}`);
  const xml = await res.text();
  const contentMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
  const content = contentMatch?.[1]?.replace(/\s+/g, " ").trim() || "내용을 불러올 수 없습니다.";

  const gptRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: `다음 논문 내용을 요약해줘:\n\n${content}` }],
  });

  return NextResponse.json({ summary: gptRes.choices[0].message.content });
}
