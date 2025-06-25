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
    setPapers(data.slice(0, 20)); // 최대 20개 제한
  };

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    const res = await fetch(`/api/summary?id=${id}`);
    const data = await res.json();
    setSummary(data.summary);
  };

  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">🔍 논문 검색 및 요약</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded text-black w-full"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          검색
        </button>
      </div>

      <ul className="space-y-2">
        {papers.map((paper) => (
          <li
            key={paper.id}
            className={`cursor-pointer border p-2 rounded transition 
              ${selectedId === paper.id ? "bg-gray-600" : "bg-gray-900"} 
              hover:bg-gray-700`}
            onClick={() => handleSelect(paper.id)}
          >
            {paper.title}
          </li>
        ))}
      </ul>

      {summary && (
        <div className="bg-gray-800 text-white p-4 rounded mt-6">
          <p className="font-semibold mb-2">📝 요약:</p>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
