import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import formidable, { File } from "formidable";
import fs from "fs/promises";
import { IncomingForm } from "formidable";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 텍스트 추출 함수 정의
async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const pdf = await import("pdf-parse");
  const data = await pdf.default(buffer);
  return data.text;
}

export async function POST(req: Request): Promise<Response> {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });

    form.parse(req as any, async (err: any, fields: Record<string, any>, files: Record<string, File>) => {
      try {
        if (err) {
          reject(new Error("Form parsing failed"));
          return;
        }

        const file = files.file;
        const prompt = fields.prompt?.toString() || "다음 PDF 문서를 핵심만 3줄로 요약해줘.";
        const language = fields.language?.toString() || "ko-KR";

        if (!file || Array.isArray(file)) {
          reject(new Error("유효한 PDF 파일이 없습니다."));
          return;
        }

        const buffer = await fs.readFile(file.filepath);
        const text = await extractTextFromPdf(buffer);

        const messages = [
          { role: "system", content: "당신은 논문을 요약해주는 AI입니다." },
          { role: "user", content: `${prompt}\n\n${text}` },
        ];

        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages,
        });

        const summary = completion.choices[0]?.message.content ?? "요약에 실패했습니다.";
        resolve(NextResponse.json({ summary }));
      } catch (e) {
        console.error(e);
        reject(NextResponse.json({ error: "처리 중 오류 발생" }, { status: 500 }));
      }
    });
  });
}
