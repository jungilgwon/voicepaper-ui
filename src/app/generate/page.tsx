// src/app/generate/page.tsx
export default function GeneratePage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎙️ 논문 팟캐스트 생성</h1>
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
