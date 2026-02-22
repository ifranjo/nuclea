export default function Loading() {
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back button + title bar */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-neutral-100 animate-pulse" />
          <div className="h-7 w-56 rounded bg-neutral-100 animate-pulse" />
        </div>

        {/* Capsule meta */}
        <div className="h-4 w-40 rounded bg-neutral-100 animate-pulse" />

        {/* Calendar / content area */}
        <div className="h-64 rounded-xl border border-nuclea-border bg-nuclea-secondary animate-pulse" />

        {/* Content grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-lg border border-nuclea-border bg-nuclea-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
