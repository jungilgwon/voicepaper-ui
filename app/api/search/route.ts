import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  if (!query) return NextResponse.json({ papers: [] });

  const response = await axios.get("https://arxiv.org/search/", {
    params: {
      query,
      searchtype: "all",
      abstracts: "show",
      order: "-announced_date_first",
      size: 20,
    },
  });

  const $ = cheerio.load(response.data);
  const papers: { id: string; title: string }[] = [];

  $(".arxiv-result").each((_, el) => {
    const id = $(el).find(".list-title a").attr("href")?.split("/abs/")[1];
    const title = $(el).find(".title").text().trim();
    if (id && title) papers.push({ id, title });
  });

  return NextResponse.json({ papers });
}
