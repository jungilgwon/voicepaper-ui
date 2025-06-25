"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState<{ id: string; title: string }[]>([]);
  const [summary, setSummary] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSearch = async () => {
    const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setPapers(data.slice(0, 20));
  };

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    const res = await fetch(`/api/summary?id=${id}`);
    const data = await res.json();
    setSummary(data.summary);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white flex items-center gap-2">
          <span role="img" aria-label="search">🔍</span> 논문 검색 및 요약
        </h1>

        <div className="flex gap-2 mb-6">
          <input
            className="flex-1 px-4 py-2 rounded bg-[#1e1e1e] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="예: AI, DNA, 로봇..."
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold shadow"
          >
            검색
          </button>
        </div>

        <ul className="space-y-2">
          {papers.map((paper) => (
            <li
              key={paper.id}
              onClick={() => handleSelect(paper.id)}
              className={`p-4 rounded-lg cursor-pointer transition-colors shadow border 
                ${
                  selectedId === paper.id
                    ? "bg-blue-600 border-blue-400"
                    : "bg-[#1e1e1e] border-gray-700 hover:border-blue-400"
                }`}
            >
              {paper.title}
            </li>
          ))}
        </ul>

        {summary && (
          <div className="mt-8 bg-[#1e1e1e] border border-gray-700 rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold mb-2 text-blue-400">📝 요약</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
