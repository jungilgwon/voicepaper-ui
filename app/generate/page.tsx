"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [summary, setSummary] = useState("");

  const handleSearch = async () => {
    const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setPapers(data.papers);
    setSelectedId(null);
    setSummary("");
  };

  const handleSelect = async (id) => {
    setSelectedId(id);
    const res = await fetch(`/api/summary?id=${id}`);
    const data = await res.json();
    setSummary(data.summary);
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 논문 검색 및 요약</h1>
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="검색어를 입력하세요 (예: DNA)"
          className="border rounded px-3 py-2 mr-2 w-80"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          검색
        </button>
      </div>
      <ul className="space-y-2 mb-6">
        {papers.map((paper) => (
          <li
            key={paper.id}
            className={`cursor-pointer border p-2 rounded hover:bg-gray-100 ${selectedId === paper.id ? "bg-gray-100" : ""}`}
            onClick={() => handleSelect(paper.id)}
          >
            {paper.title}
          </li>
        ))}
      </ul>
      {summary && (
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="font-semibold mb-2">요약:</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}
