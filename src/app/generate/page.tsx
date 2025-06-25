'use client'

import { useState } from 'react'

const categories = [
  { name: "자연어처리", code: "cs.CL" },
  { name: "컴퓨터비전", code: "cs.CV" },
  { name: "기계학습", code: "cs.LG" },
  { name: "로보틱스", code: "cs.RO" },
  { name: "인공지능", code: "cs.AI" },
]

export default function GeneratePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategoryClick = (code: string) => {
    setSelectedCategory(code)
    console.log('선택된 주제:', code)
    // TODO: fetch(`/api/arxiv/list?cat=${code}`)
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ 논문 팟캐스트 생성</h1>

      <div className="mb-6">
        <p className="font-semibold mb-2">주제를 선택하세요:</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.code}
              onClick={() => handleCategoryClick(cat.code)}
              className={`px-3 py-1 rounded border 
                ${selectedCategory === cat.code ? 'bg-black text-white' : 'bg-white text-black'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">논문 URL</label>
          <input
            type="url"
            placeholder="https://arxiv.org/abs/..."
            className="w-full border rounded p-2"
            required
          />
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">
          요약 및 음성 생성
        </button>
      </form>
    </main>
  )
}
