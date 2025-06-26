import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import pdfParse from "pdf-parse";
import { Readable } from "stream";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

  const data: any = await new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const file = data.files.file[0];
  const buffer = fs.readFileSync(file.filepath);
  const pdf = await pdfParse(buffer);
  const text = pdf.text.slice(0, 3000); // GPT 처리 한계 방지

  const prompt = data.fields.prompt?.[0] || "이 논문을 간단히 요약해줘";

  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "당신은 논문 요약 전문가입니다." },
      { role: "user", content: `${prompt}:\n\n${text}` },
    ],
    model: "gpt-4",
  });

  const summary = completion.choices[0].message.content;

  return NextResponse.json({ summary });
}
