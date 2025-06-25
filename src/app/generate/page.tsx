// src/app/generate/page.tsx
'use client';

import { useState } from 'react';

const categories = [
  { name: "자연어처리", code: "cs.CL" },
  { name: "컴퓨터비전", code: "cs.CV" },
  { name: "기계학습", code: "cs.LG" },
  { name: "로보틱스", code: "cs.RO" },
  { name: "인공지능", code: "cs.AI" },
];

export default function GeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPapers = async (query: string) => {
    setLoading(true);
    const res = await fetch(`https://export.arxiv.org/api/query?search_query=cat:${query}&max_results=5`);
    const text = await res.text();

    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const entries = xml.getElementsByTagName("entry");

    const results = Array.from(entries).map((entry: any) => ({
      title: entry.getElementsByTagName("title")[0].textContent,
      summary: entry.getElementsByTagName("summary")[0].textContent,
      link: entry.getElementsByTagName("id")[0].textContent,
    }));

    setPapers(results);
    setLoading(false);
  };

  const handleCategoryClick = (code: string) => {
    setSelectedCategory(code);
    fetchPapers(code);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ 논문 팟캐스트 생성</h1>

      <div className="mb-4">
        <p className="mb-2 font-medium">주제를 선택하세요:</p>
        <div className="flex gap-2 flex-wrap">
          {categories.map(({ name, code }) => (
            <button
              key={code}
              onClick={() => handleCategoryClick(code)}
              className={`px-3 py-1 border rounded ${selectedCategory === code ? 'bg-black text-white' : 'bg-white'}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {loading && <p>불러오는 중...</p>}

      {papers.length > 0 && (
        <ul className="space-y-4">
          {papers.map((paper, index) => (
            <li key={index} className="p-4 border rounded bg-white text-black">
              <h2 className="font-semibold text-lg mb-2">{paper.title}</h2>
              <p className="text-sm mb-2">{paper.summary?.slice(0, 300)}...</p>
              <a href={paper.link} target="_blank" className="text-blue-600 underline">논문 보기</a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
