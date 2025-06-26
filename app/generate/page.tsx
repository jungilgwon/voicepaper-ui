"use client";

import { useState } from "react";

export default function UploadPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("ko-KR");
  const [customPrompt, setCustomPrompt] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setAudioUrl(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    formData.append("prompt", customPrompt);

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");

      const data = await res.json();
      setSummary(data.summary);

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.summary, language }),
      });

      if (!ttsRes.ok) throw new Error("TTS 변환 실패");

      const ttsData = await ttsRes.json();
      setAudioUrl(ttsData.audioUrl);
    } catch (err) {
      console.error(err);
      setError("요약 또는 음성 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto bg-gradient-to-b from-sky-50 via-white to-sky-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-900 drop-shadow">
        📄 PDF 논문 업로드 및 요약 + 음성 생성
      </h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block text-gray-800"
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">언어 선택:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="ko-KR">한국어</option>
          <option value="en-US">영어</option>
          <option value="ja-JP">일본어</option>
          <option value="de-DE">독일어</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">요약 커스터마이징 (예: 3줄 요약, 결론 중심 등):</label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="요약 방식 입력"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium shadow-md transition disabled:opacity-50"
      >
        {loading ? "요약 및 음성 생성 중..." : "업로드 및 처리"}
      </button>

      {error && <p className="text-red-600 mt-4 font-medium">❗ {error}</p>}

      {summary && (
        <div className="mt-6 p-6 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-3 text-blue-700">📘 요약 결과:</h2>
          <p className="mb-4 whitespace-pre-line leading-relaxed text-gray-900">{summary}</p>

          {audioUrl && (
            <div className="flex items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-blue-600">🔊 음성 재생:</h3>
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                  브라우저가 오디오 태그를 지원하지 않습니다.
                </audio>
              </div>
              <a
                href={audioUrl}
                download="summary.mp3"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-md transition"
              >
                ⬇ 다운로드
              </a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
