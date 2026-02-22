export default function Loading() {
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="h-8 w-48 rounded bg-neutral-100 animate-pulse" />
        <div className="h-4 w-64 rounded bg-neutral-100 animate-pulse" />

        {/* Storage bar skeleton */}
        <div className="h-3 w-full max-w-xs rounded-full bg-neutral-100 animate-pulse" />

        {/* Capsule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-nuclea-border bg-nuclea-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    </main>
  )
}
