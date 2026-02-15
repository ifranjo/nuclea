'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Mobile → fullscreen onboarding; Desktop → iPhone demo frame
    const isMobile = window.innerWidth < 768
    router.replace(isMobile ? '/onboarding' : '/demo')
  }, [router])

  return null
}
