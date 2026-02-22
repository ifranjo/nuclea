export default function Loading() {
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Shared capsule header */}
        <div className="text-center space-y-3">
          <div className="h-8 w-52 rounded bg-neutral-100 animate-pulse mx-auto" />
          <div className="h-4 w-72 rounded bg-neutral-100 animate-pulse mx-auto" />
        </div>

        {/* Content area */}
        <div className="h-56 rounded-xl border border-nuclea-border bg-nuclea-secondary animate-pulse" />

        {/* Content items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
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
