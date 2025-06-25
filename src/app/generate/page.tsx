"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState([]);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const searchPapers = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSelectedPaper(null);
    setSummary("");
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const data = await res.json();
      setPapers(data.papers);
    } catch (err) {
      alert("검색 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (paperId: string) => {
    setSelectedPaper(paperId);
    setSummary("요약 로딩 중...");
    try {
      const res = await fetch(`/api/summary?id=${paperId}`);
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setSummary("요약을 가져오는 데 실패했습니다.");
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 논문 검색 및 요약</h1>
      <form onSubmit={searchPapers} className="mb-4">
        <input
          type="text"
          placeholder="키워드를 입력하세요 (예: DNA, Transformer 등)"
          className="border rounded p-2 w-full"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button
          type="submit"
          className="mt-2 px-4 py-2 bg-black text-white rounded"
          disabled={loading}
        >
          {loading ? "검색 중..." : "논문 검색"}
        </button>
      </form>

      {papers.length > 0 && (
        <ul className="mb-6 space-y-2">
          {papers.map((paper) => (
            <li
              key={paper.id}
              className="cursor-pointer text-blue-600 underline"
              onClick={() => fetchSummary(paper.id)}
            >
              {paper.title}
            </li>
          ))}
        </ul>
      )}

      {selectedPaper && (
        <div className="p-4 border rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">요약 결과</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}
