'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Hero from '@/components/landing/Hero'
import Capsules from '@/components/landing/Capsules'
import AISection from '@/components/landing/AISection'
import Pricing from '@/components/landing/Pricing'
import Waitlist from '@/components/landing/Waitlist'

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <Hero />
        <Capsules />
        <AISection />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </>
  )
}
