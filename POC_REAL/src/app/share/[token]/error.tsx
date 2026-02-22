'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className='min-h-screen bg-white flex items-center justify-center px-6'>
      <div className='max-w-md w-full rounded-xl border border-nuclea-border bg-nuclea-secondary p-6 text-center space-y-4'>
        <h1 className='text-lg font-medium text-nuclea-text'>Enlace no disponible</h1>
        <p className='text-sm text-nuclea-text-muted'>
          No se pudo cargar la cápsula compartida en este momento.
        </p>
        <button
          onClick={reset}
          className='px-4 py-2 bg-transparent border-[1.5px] border-nuclea-text rounded-lg text-sm font-medium text-nuclea-text hover:bg-nuclea-text hover:text-white transition-all'
        >
          Reintentar
        </button>
      </div>
    </main>
  )
}

