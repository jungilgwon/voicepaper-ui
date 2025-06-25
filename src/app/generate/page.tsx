"use client";

import { useState } from "react";
import axios from "axios";

const categories = [
  { name: "자연어처리", code: "cs.CL" },
  { name: "컴퓨터비전", code: "cs.CV" },
  { name: "기계학습", code: "cs.LG" },
  { name: "로보틱스", code: "cs.RO" },
  { name: "인공지능", code: "cs.AI" },
];

export default function GeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPapers = async (categoryCode: string) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://export.arxiv.org/api/query?search_query=cat:${categoryCode}&start=0&max_results=5`
      );

      const parser = new DOMParser();
      const xml = parser.parseFromString(res.data, "application/xml");
      const entries = xml.getElementsByTagName("entry");

      const parsedPapers = Array.from(entries).map((entry) => ({
        title: entry.getElementsByTagName("title")[0]?.textContent,
        summary: entry.getElementsByTagName("summary")[0]?.textContent,
        link: entry.getElementsByTagName("id")[0]?.textContent,
      }));

      setPapers(parsedPapers);
    } catch (err) {
      console.error("논문 불러오기 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ 논문 팟캐스트 생성</h1>

      <div className="mb-4">
        <p className="mb-2 font-medium">주제를 선택하세요:</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => {
                setSelectedCategory(cat.code);
                fetchPapers(cat.code);
              }}
              className={`px-4 py-2 rounded border ${
                selectedCategory === cat.code ? "bg-black text-white" : ""
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>논문 불러오는 중...</p>}

      {!loading && papers.length > 0 && (
        <div className="space-y-4">
          {papers.map((paper, index) => (
            <div
              key={index}
              className="p-4 border rounded bg-white text-black shadow"
            >
              <h2 className="text-lg font-semibold mb-2">{paper.title}</h2>
              <p className="text-sm mb-2">{paper.summary}</p>
              <a
                href={paper.link}
                className="text-blue-600 underline text-sm"
                target="_blank"
              >
                논문 보기
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
