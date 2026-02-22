export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-[#0D0D12]">
      {/* Header skeleton */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="h-8 w-28 rounded bg-white/5 animate-pulse" />
        <div className="h-10 w-64 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title + actions row */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
          <div className="h-10 w-36 rounded-lg bg-white/5 animate-pulse" />
        </div>

        {/* Capsule card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[200px] rounded-2xl bg-white/5 animate-pulse"
            />
          ))}
        </div>

        {/* Storage bar */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-3 flex-1 rounded-full bg-white/5 animate-pulse" />
          <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
    </main>
  )
}
