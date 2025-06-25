export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");

  return Response.json({
    papers: [
      { id: "1", title: `${keyword} 관련 논문 1` },
      { id: "2", title: `${keyword} 관련 논문 2` },
    ],
  });
}
