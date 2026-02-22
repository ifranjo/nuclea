export default function CapsuleDetailLoading() {
  return (
    <main className="min-h-screen bg-[#0D0D12]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="h-8 w-28 rounded bg-white/5 animate-pulse" />
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back button */}
        <div className="h-5 w-32 rounded bg-white/5 animate-pulse mb-6" />

        {/* Title + status badge */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-9 w-64 rounded bg-white/5 animate-pulse" />
          <div className="h-6 w-20 rounded-full bg-white/5 animate-pulse" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-4 border-b border-white/10 pb-3 mb-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-5 w-24 rounded bg-white/5 animate-pulse"
            />
          ))}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-40 rounded-xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
