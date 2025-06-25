import { NextResponse } from "next/server";
import { Readable } from "stream";
import pdfParse from "pdf-parse";

export const runtime = "nodejs"; // edge에서는 안됨

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const data = await pdfParse(buffer);
    const summary = await summarizeText(data.text);
    return NextResponse.json({ summary });
  } catch (err) {
    return NextResponse.json({ error: "PDF 파싱 실패" }, { status: 500 });
  }
}

async function summarizeText(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되지 않았습니다.");

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "다음 텍스트를 한국어로 간결하게 요약해주세요."
        },
        {
          role: "user",
          content: text.slice(0, 8000) // 너무 긴 텍스트 방지
        }
      ]
    })
  });

  const json = await res.json();
  return json.choices?.[0]?.message?.content || "요약에 실패했습니다.";
}
