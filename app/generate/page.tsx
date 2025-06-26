"use client";

import { useState, useEffect } from "react";

// 논문 검색 결과 타입 정의
interface Paper {
  id: string;
  title: string;
}

// 논문 상세 정보 타입 정의
interface PaperDetail {
  id: string;
  title: string;
  summary: string;
  authors: string;
  published: string;
  link: string;
  category: string;
}

export default function UploadPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState("en-US");
  const [customPrompt, setCustomPrompt] = useState("");

  // 테마 상태 (기본: 다크)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // 테마 변경 시 body class 조정
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // 논문 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState(""); // 검색어
  const [searchResults, setSearchResults] = useState<Paper[]>([]); // 검색 결과
  const [searchLoading, setSearchLoading] = useState(false); // 검색 로딩

  // 논문 상세 정보 상태
  const [selectedPaperDetail, setSelectedPaperDetail] = useState<PaperDetail | null>(null); // 상세 정보
  const [showAbstract, setShowAbstract] = useState<string | null>(null); // 본문(abstract) 표시용
  const [detailLoading, setDetailLoading] = useState(false); // 상세 정보 로딩

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

  // 논문 검색 함수
  const handleSearch = async () => {
    setSearchLoading(true);
    setError("");
    setSearchResults([]);
    try {
      const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("검색 실패");
      const data = await res.json();
      setSearchResults(data.papers || []);
    } catch (err) {
      setError("논문 검색 중 오류가 발생했습니다.");
    } finally {
      setSearchLoading(false);
    }
  };

  // 논문 상세 정보 불러오기 함수
  const handleShowDetail = async (paper: Paper) => {
    setDetailLoading(true);
    setSelectedPaperDetail(null);
    setShowAbstract(null);
    try {
      // arXiv API에서 논문 상세 정보(abstract, authors 등) 가져오기
      const res = await fetch(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(paper.id)}`);
      const xml = await res.text();
      // 간단한 파싱 (실제 서비스에서는 robust하게 처리 필요)
      const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
      const authorMatch = xml.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/);
      const publishedMatch = xml.match(/<published>([\s\S]*?)<\/published>/);
      const linkMatch = xml.match(/<id>([\s\S]*?)<\/id>/);
      const categoryMatch = xml.match(/<category term="([^"]+)"/);
      setSelectedPaperDetail({
        id: paper.id,
        title: titleMatch ? titleMatch[1].replace(/\n/g, " ").trim() : paper.title,
        summary: summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim() : "",
        authors: authorMatch ? authorMatch[1].trim() : "",
        published: publishedMatch ? publishedMatch[1].trim() : "",
        link: linkMatch ? linkMatch[1].trim() : `https://arxiv.org/abs/${paper.id}`,
        category: categoryMatch ? categoryMatch[1] : "-",
      });
    } catch (err) {
      setError("논문 상세 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setDetailLoading(false);
    }
  };

  // 본문(abstract) 보기 토글 함수
  const handleShowAbstract = (summary: string) => {
    setShowAbstract(showAbstract === summary ? null : summary);
  };

  // 논문 선택 후 요약 및 TTS 처리 함수
  const handlePaperSelect = async (paper: Paper) => {
    setLoading(true);
    setError("");
    setSummary("");
    setAudioUrl(null);
    try {
      // 논문 요약 요청
      const res = await fetch(`/api/summary?id=${encodeURIComponent(paper.id)}`);
      if (!res.ok) throw new Error("요약 실패");
      const data = await res.json();
      setSummary(data.summary);
      // TTS 변환 요청
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.summary, language }),
      });
      if (!ttsRes.ok) throw new Error("TTS 변환 실패");
      const ttsData = await ttsRes.json();
      setAudioUrl(ttsData.audioUrl);
    } catch (err) {
      setError("요약 또는 음성 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={
      `p-6 max-w-2xl mx-auto min-h-screen transition-colors duration-300 ` +
      (theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100'
        : 'bg-gradient-to-br from-blue-50 via-white to-indigo-100 text-gray-900')
    }>
      {/* 테마 토글 버튼 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={
            'px-4 py-2 rounded-xl font-semibold shadow-md transition ' +
            (theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900')
          }
        >
          {theme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드'}
        </button>
      </div>
      <div className="mb-10 flex flex-col items-center">
        <h1 className="text-4xl font-extrabold mb-2 text-indigo-800 dark:text-indigo-200 drop-shadow-sm tracking-tight">📄 논문 팟캐스트 생성</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-2">논문 검색, 요약, 음성 변환까지 한 번에!</p>
      </div>

      {/* 언어 선택 드롭다운 */}
      <div className="mb-6 flex items-center gap-3">
        <label className="font-semibold text-gray-700 dark:text-gray-200">언어 선택:</label>
        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-200 focus:outline-none shadow-sm transition"
        >
          <option value="en-US">영어</option>
          <option value="ko-KR">한국어</option>
          <option value="ja-JP">일본어</option>
          <option value="zh-CN">중국어</option>
        </select>
      </div>

      {/* 논문 검색 UI */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <label className="block mb-3 font-semibold text-gray-700 dark:text-gray-200 text-lg">arXiv 논문 검색</label>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="논문 제목, 키워드 등 입력"
            className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:outline-none text-base shadow-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition"
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading || !searchQuery}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow-md transition disabled:opacity-50"
          >
            {searchLoading ? "검색 중..." : "검색"}
          </button>
        </div>
        {/* 검색 결과 리스트 */}
        {searchResults.length > 0 && (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {searchResults.map(paper => (
              <li key={paper.id} className="py-3 flex flex-col gap-1 group hover:bg-indigo-50 dark:hover:bg-gray-700 rounded-xl px-2 transition">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-gray-100 text-base font-semibold group-hover:text-indigo-700 dark:group-hover:text-indigo-200 transition">{paper.title}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePaperSelect(paper)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-sm transition"
                      disabled={loading}
                    >
                      요약+TTS
                    </button>
                    <button
                      onClick={() => handleShowDetail(paper)}
                      className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-1 rounded-lg text-xs font-bold shadow-sm transition"
                      disabled={detailLoading}
                    >
                      상세 정보
                    </button>
                  </div>
                </div>
                {/* 상세 정보 표시 */}
                {selectedPaperDetail && selectedPaperDetail.id === paper.id && (
                  <div className="mt-3 p-4 bg-indigo-50 dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 rounded-xl text-sm text-gray-800 dark:text-gray-100 shadow-inner">
                    <div className="mb-1"><b>제목:</b> {selectedPaperDetail.title}</div>
                    <div className="mb-1"><b>저자:</b> {selectedPaperDetail.authors}</div>
                    <div className="mb-1"><b>발행일:</b> {selectedPaperDetail.published}</div>
                    <div className="mb-1"><b>카테고리:</b> <span className="inline-block bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full text-xs font-semibold">{selectedPaperDetail.category}</span></div>
                    <div className="mb-2"><b>arXiv 링크:</b> <a href={selectedPaperDetail.link} target="_blank" rel="noopener noreferrer" className="text-indigo-700 dark:text-indigo-300 underline hover:text-indigo-900 dark:hover:text-indigo-100">{selectedPaperDetail.link}</a></div>
                    <button
                      onClick={() => handleShowAbstract(selectedPaperDetail.summary)}
                      className="mt-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 px-3 py-1 rounded-lg text-xs font-bold transition"
                    >
                      본문 내용 보기
                    </button>
                    {/* 본문(abstract) 표시 */}
                    {showAbstract === selectedPaperDetail.summary && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs whitespace-pre-line shadow-sm text-gray-900 dark:text-gray-100">
                        {selectedPaperDetail.summary}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block text-gray-800 dark:text-gray-100"
      />

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">언어 선택:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="en-US">영어</option>
          <option value="ko-KR">한국어</option>
          <option value="ja-JP">일본어</option>
          <option value="zh-CN">중국어</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">요약 커스터마이징 (예: 3줄 요약, 결론 중심 등):</label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="요약 방식 입력"
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
