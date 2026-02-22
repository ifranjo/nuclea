export default function Loading() {
  return (
    <main className="min-h-[100dvh] bg-nuclea-bg px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back + title */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-neutral-100 animate-pulse" />
          <div className="h-7 w-48 rounded bg-neutral-100 animate-pulse" />
        </div>

        {/* Content area */}
        <div className="h-56 rounded-xl border border-nuclea-border bg-neutral-50 animate-pulse" />

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg border border-nuclea-border bg-neutral-50 animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
