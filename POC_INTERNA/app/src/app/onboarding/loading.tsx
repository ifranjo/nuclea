export default function Loading() {
  return (
    <main className="min-h-[100dvh] bg-nuclea-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Capsule placeholder */}
        <div className="h-60 w-60 rounded-full bg-neutral-100 animate-pulse mx-auto" />
        {/* Title */}
        <div className="h-6 w-40 rounded bg-neutral-100 animate-pulse mx-auto" />
        {/* Subtitle */}
        <div className="h-4 w-56 rounded bg-neutral-100 animate-pulse mx-auto" />
      </div>
    </main>
  )
}
