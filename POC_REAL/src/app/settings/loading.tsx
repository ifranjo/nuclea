export default function Loading() {
  return (
    <main className="min-h-screen bg-white px-6 py-8">
      <div className="mx-auto max-w-lg space-y-6">
        {/* Title */}
        <div className="h-8 w-36 rounded bg-neutral-100 animate-pulse" />

        {/* Avatar circle */}
        <div className="h-20 w-20 rounded-full bg-neutral-100 animate-pulse mx-auto" />

        {/* Form fields */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-neutral-100 animate-pulse" />
            <div className="h-10 w-full rounded-lg border border-nuclea-border bg-nuclea-secondary animate-pulse" />
          </div>
        ))}

        {/* Save button */}
        <div className="h-10 w-full rounded-lg bg-neutral-100 animate-pulse" />
      </div>
    </main>
  )
}
