export default function ConsentimientoLoading() {
  return (
    <main className="min-h-screen bg-[#0D0D12] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Page title */}
        <div className="h-10 w-72 rounded bg-white/5 animate-pulse mb-3" />
        <div className="h-4 w-48 rounded bg-white/5 animate-pulse mb-10" />

        {/* Form area */}
        <div className="space-y-6">
          {/* Consent checkboxes */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded bg-white/5 animate-pulse mt-0.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Submit button */}
        <div className="mt-10 h-12 w-full rounded-lg bg-white/5 animate-pulse" />
      </div>
    </main>
  )
}
