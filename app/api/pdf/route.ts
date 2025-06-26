import { Buffer } from "buffer";

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdfParse from "pdf-parse";

// PDF에서 텍스트 추출 함수
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  return data.text;
}

export async function POST(req: Request): Promise<Response> {
  // 빌드/프리렌더링 환경에서 API 키가 없으면 바로 에러 반환
  if (process.env.NODE_ENV === "production" && !process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "API 사용 불가: OPENAI_API_KEY 없음" }, { status: 400 });
  }

  try {
    // FormData로 파일 및 기타 데이터 받기
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const prompt = formData.get("prompt")?.toString() || "다음 PDF 문서를 핵심만 3줄로 요약해줘..";
    const language = formData.get("language")?.toString() || "ko-KR";

    // 업로드된 파일이 없으면 에러 반환
    if (!file) {
      return NextResponse.json({ error: "유효한 PDF 파일이 없습니다." }, { status: 400 });
    }

    // 파일을 ArrayBuffer로 읽어서 Buffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // PDF 텍스트 추출
    const text = await extractTextFromPdf(buffer);

    // 언어별 프롬프트 추가
    let langPrompt = "";
    switch (language) {
      case "en-US":
        langPrompt = "Summarize the following PDF document in 3 key sentences in English.";
        break;
      case "ja-JP":
        langPrompt = "次のPDF文書を日本語で3つの重要な文で要約してください。";
        break;
      case "de-DE":
        langPrompt = "Fassen Sie das folgende PDF-Dokument in drei Schlüsselsätzen auf Deutsch zusammen.";
        break;
      default:
        langPrompt = "다음 PDF 문서를 한국어로 핵심만 3줄로 요약해줘.";
    }

    // 커스텀 프롬프트가 있으면 우선 사용, 없으면 언어별 기본 프롬프트 사용
    const finalPrompt = prompt.trim() ? prompt : langPrompt;

    // OpenAI 메시지 타입 명확히 지정
    const messages = [
      { role: "system", content: "당신은 논문을 요약해주는 AI입니다." },
      { role: "user", content: `${finalPrompt}\n\n${text}` },
    ];

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
    });

    const summary = completion.choices[0]?.message.content ?? "요약에 실패했습니다.";
    return NextResponse.json({ summary });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "처리 중 오류 발생" }, { status: 500 });
  }
}
