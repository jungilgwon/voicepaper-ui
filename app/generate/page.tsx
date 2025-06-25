"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [keyword, setKeyword] = useState("");
  const [papers, setPapers] = useState<{ id: string; title: string }[]>([]);
  const [summary, setSummary] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [voiceStyle, setVoiceStyle] = useState("default");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [pdfText, setPdfText] = useState<string | null>(null);

  const handleSearch = async () => {
    const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setPapers(data.papers.slice(0, 20));
  };

  const handleSelect = async (id: string) => {
    setSelectedId(id);
    const res = await fetch(`/api/summary?id=${id}`);
    const data = await res.json();
    setSummary(data.summary);
  };

  const handlePlay = async () => {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: summary,
        style: voiceStyle,
        speed: voiceSpeed,
      }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/pdf", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setPdfText(data.text);
    setSummary(data.summary);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-4 py-8">
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

        <div className="mb-6">
          <label className="block mb-2 text-sm text-gray-300">PDF 업로드:</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="text-white"
          />
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
                    : "bg-[#2a2a2a] border-gray-700 hover:border-blue-400 hover:bg-[#444]"
                }`}
            >
              {paper.title}
            </li>
          ))}
        </ul>

        {summary && (
          <div className="mt-8 bg-[#1a1a1a] border border-gray-600 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-blue-400">📝 요약</h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap mb-4">
              {summary}
            </p>

            <div className="flex gap-4 items-center">
              <label className="text-gray-300">스타일:</label>
              <select
                className="bg-[#2a2a2a] border border-gray-600 text-white px-2 py-1 rounded"
                value={voiceStyle}
                onChange={(e) => setVoiceStyle(e.target.value)}
              >
                <option value="default">기본</option>
                <option value="narration">나레이션</option>
                <option value="conversational">대화체</option>
              </select>

              <label className="text-gray-300 ml-4">속도:</label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="2.0"
                className="w-20 bg-[#2a2a2a] border border-gray-600 text-white px-2 py-1 rounded"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              />

              <button
                onClick={handlePlay}
                className="ml-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow"
              >
                ▶️ 재생
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
