export default function PrivacidadLoading() {
  return (
    <main className="min-h-screen bg-[#0D0D12] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <div className="h-4 w-28 rounded bg-white/5 animate-pulse mb-8" />

        {/* Title */}
        <div className="h-10 w-80 rounded bg-white/5 animate-pulse mb-3" />
        <div className="h-4 w-56 rounded bg-white/5 animate-pulse mb-10" />

        {/* Paragraph blocks */}
        <div className="space-y-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-48 rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-white/5 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
