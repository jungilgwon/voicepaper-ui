import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");

  if (!keyword) {
    return NextResponse.json({ papers: [] });
  }

  const response = await fetch(`http://export.arxiv.org/api/query?search_query=all:${keyword}&start=0&max_results=20`);
  const xml = await response.text();

  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
  const papers = entries.map((entry, idx) => {
    const titleMatch = entry[1].match(/<title>([\s\S]*?)<\/title>/);
    return {
      id: `arxiv-${idx}`,
      title: titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : `제목 없음 ${idx}`
    };
  });

  return NextResponse.json({ papers });
}
