"use client";

import { useState } from "react";

export default function UploadPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError("요약 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📄 PDF 논문 업로드 및 요약</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block"
      />

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "요약 중..." : "업로드 및 요약"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {summary && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">요약 결과:</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}
