'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { P1CapsuleClosed } from '@/components/onboarding/P1CapsuleClosed'
import { P2CapsuleOpening } from '@/components/onboarding/P2CapsuleOpening'
import { P3Manifesto } from '@/components/onboarding/P3Manifesto'
import { P4CapsuleSelection } from '@/components/onboarding/P4CapsuleSelection'
import type { OnboardingStep } from '@/types'

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

const fadeTransition = { duration: 0.3 }

function readStepFromUrl(): OnboardingStep {
  if (typeof window === 'undefined') return 1
  const requested = Number(new URLSearchParams(window.location.search).get('step'))
  return (Number.isInteger(requested) && requested >= 1 && requested <= 4)
    ? (requested as OnboardingStep)
    : 1
}

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(readStepFromUrl)
  const didMount = useRef(false)

  const next = useCallback(() => {
    setStep((prev) => (prev < 4 ? ((prev + 1) as OnboardingStep) : prev))
  }, [])

  useEffect(() => {
    // Skip first render — URL already has the correct step from lazy init
    if (!didMount.current) {
      didMount.current = true
      return
    }

    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('step', String(step))
    window.history.replaceState(null, '', currentUrl.toString())

    const detail = {
      step,
      source: 'onboarding-flow',
      timestamp: new Date().toISOString(),
    }

    window.dispatchEvent(new CustomEvent('nuclea:onboarding-step', { detail }))
    console.info('[onboarding-step]', detail)
  }, [step])

  return (
    <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="p1"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeTransition}
        >
          <P1CapsuleClosed onNext={next} />
        </motion.div>
      )}
      {step === 2 && (
        <motion.div
          key="p2"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeTransition}
        >
          <P2CapsuleOpening onNext={next} />
        </motion.div>
      )}
      {step === 3 && (
        <motion.div
          key="p3"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeTransition}
        >
          <P3Manifesto onNext={next} />
        </motion.div>
      )}
      {step === 4 && (
        <motion.div
          key="p4"
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={fadeTransition}
        >
          <P4CapsuleSelection />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
