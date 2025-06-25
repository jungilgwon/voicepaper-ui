export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");

  return NextResponse.json({
    papers: [
      { id: "paper1", title: `${keyword} 논문 1` },
      { id: "paper2", title: `${keyword} 논문 2` },
    ],
  });
}
