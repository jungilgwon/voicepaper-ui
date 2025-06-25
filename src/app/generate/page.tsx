import { useState } from "react";

const categories = [
  { name: "자연어처리", code: "cs.CL" },
  { name: "컴퓨터비전", code: "cs.CV" },
  { name: "기계학습", code: "cs.LG" },
  { name: "로보틱스", code: "cs.RO" },
  { name: "인공지능", code: "cs.AI" },
];

interface Paper {
  id: string;
  title: string;
  summary: string;
  link: string;
}

export default function GeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPapers = async (categoryCode: string) => {
    setLoading(true);
    setSelectedCategory(categoryCode);
    try {
      const response = await fetch(
        `https://export.arxiv.org/api/query?search_query=cat:${categoryCode}&start=0&max_results=5&sortBy=submittedDate&sortOrder=descending`
      );
      const xml = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "text/xml");
      const entries = Array.from(xmlDoc.getElementsByTagName("entry"));
      const parsedPapers = entries.map((entry) => ({
        id: entry.getElementsByTagName("id")[0].textContent || "",
        title:
          entry.getElementsByTagName("title")[0].textContent?.trim() || "",
        summary:
          entry.getElementsByTagName("summary")[0].textContent?.trim() || "",
        link: entry.getElementsByTagName("id")[0].textContent || "",
      }));
      setPapers(parsedPapers);
    } catch (error) {
      console.error("arXiv fetch error:", error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ 논문 팟캐스트 생성</h1>

      <div className="mb-4">
        <p className="mb-2 font-semibold">주제를 선택하세요:</p>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => fetchPapers(cat.code)}
              className={`px-3 py-1 rounded border text-sm transition-colors ${
                selectedCategory === cat.code
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="mt-4">🔄 논문을 불러오는 중...</p>}

      <div className="space-y-4 mt-6">
        {papers.map((paper) => (
          <div key={paper.id} className="border p-4 rounded shadow-sm">
            <h2 className="text-lg font-semibold mb-1">{paper.title}</h2>
            <p className="text-sm text-gray-600 mb-2 line-clamp-3">
              {paper.summary}
            </p>
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline text-sm"
            >
              원문 보기
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
