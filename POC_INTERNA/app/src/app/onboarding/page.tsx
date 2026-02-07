'use client'

import { useState, useCallback } from 'react'
import { useEffect } from 'react'
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

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>(1)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requested = Number(params.get('step'))
    if (Number.isInteger(requested) && requested >= 1 && requested <= 4) {
      setStep(requested as OnboardingStep)
    }
  }, [])

  const next = useCallback(() => {
    setStep((prev) => (prev < 4 ? ((prev + 1) as OnboardingStep) : prev))
  }, [])

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
