// src/app/api/search/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword");

  const papers = [
    { id: "paper1", title: `DNA 구조 분석 논문 1` },
    { id: "paper2", title: `DNA와 RNA 비교 연구 2` },
  ];

  const filtered = papers.filter(p => p.title.includes(keyword || ""));

  return new Response(JSON.stringify({ papers: filtered }), {
    headers: { "Content-Type": "application/json" },
  });
}
