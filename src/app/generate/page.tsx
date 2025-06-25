'use client'

import { useState } from 'react'

export default function GeneratePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])

  const handleSearch = async () => {
    const encoded = encodeURIComponent(`all:${query}`)
    const url = `https://export.arxiv.org/api/query?search_query=${encoded}&start=0&max_results=5`
    const res = await fetch(url)
    const text = await res.text()

    // 간단한 파싱 (정식 XML 파싱은 나중에)
    const entries = [...text.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(entry => {
      const title = entry[1].match(/<title>([\s\S]*?)<\/title>/)?.[1].trim()
      const id = entry[1].match(/<id>(.*?)<\/id>/)?.[1].trim()
      return { title, id }
    })

    setResults(entries)
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 논문 검색 및 팟캐스트 생성</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="예: DNA, BERT, GAN..."
          className="border rounded p-2 mr-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-black text-white px-4 py-2 rounded"
        >
          검색
        </button>
      </div>

      <ul className="space-y-2">
        {results.map((item, i) => (
          <li key={i} className="border rounded p-2">
            <p className="font-semibold">{item.title}</p>
            <a href={item.id} target="_blank" className="text-blue-500 text-sm">{item.id}</a>
          </li>
        ))}
      </ul>
    </main>
  )
}
