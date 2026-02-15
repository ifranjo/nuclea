'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/ui/Header'
import { CapsuleTypeCard } from '@/components/ui/CapsuleTypeCard'
import { CAPSULE_TYPES } from '@/types'
import type { CapsuleTypeInfo } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import { useCapsules } from '@/hooks/useCapsules'

const decorativePills = [
  { w: 120, h: 58, x: '8%',  y: 44,  rotate: -24, opacity: 0.22 },
  { w: 96,  h: 46, x: '79%', y: 78,  rotate: 18,  opacity: 0.2  },
  { w: 82,  h: 40, x: '70%', y: 230, rotate: -16, opacity: 0.17 },
  { w: 102, h: 50, x: '14%', y: 286, rotate: 14,  opacity: 0.16 },
  { w: 68,  h: 34, x: '88%', y: 160, rotate: 22,  opacity: 0.14 },
  { w: 76,  h: 38, x: '4%',  y: 170, rotate: -12, opacity: 0.13 },
  { w: 54,  h: 26, x: '56%', y: 360, rotate: -20, opacity: 0.12 },
  { w: 90,  h: 44, x: '42%', y: 420, rotate: 10,  opacity: 0.1  },
]

const bgPolaroids = [
  { size: 42, x: '2%',  y: 110, rotate: -14, opacity: 0.18, src: '/images/polaroids/terrace.jpg'  },
  { size: 36, x: '84%', y: 320, rotate: 12,  opacity: 0.16, src: '/images/polaroids/group.jpg'    },
  { size: 38, x: '90%', y: 440, rotate: -8,  opacity: 0.14, src: '/images/polaroids/cathedral.jpg'},
  { size: 44, x: '6%',  y: 380, rotate: 16,  opacity: 0.15, src: '/images/polaroids/dinner.jpg'   },
]

export function P4CapsuleSelection() {
  const router = useRouter()
  const { profile } = useAuth()
  const { createCapsule } = useCapsules(profile?.id)
  const [creating, setCreating] = useState(false)

  const handleSelect = async (capsuleType: CapsuleTypeInfo) => {
    if (creating) return
    if (!profile) {
      // User not authenticated — redirect to login, then back to onboarding
      router.push('/login?redirect=/onboarding?step=4')
      return
    }
    setCreating(true)

    const typeMap: Record<string, string> = {
      'life-chapter': 'life_chapter',
    }
    const dbType = typeMap[capsuleType.id] || capsuleType.id

    const { capsule, error } = await createCapsule({
      owner_id: profile.id,
      type: dbType,
      title: capsuleType.name,
      description: capsuleType.description,
    })

    if (capsule && !error) {
      router.push(`/capsule/${capsule.id}`)
    } else {
      setCreating(false)
      alert('Error al crear la cápsula. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[radial-gradient(circle_at_50%_-8%,rgba(212,175,55,0.18),rgba(212,175,55,0.02)_36%,transparent_70%),linear-gradient(180deg,#F6F7FB_0%,#ECEEF4_100%)] relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[12%] left-[18%] w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.2)]" />
        <div className="absolute top-[22%] right-[14%] w-1 h-1 rounded-full bg-[rgba(212,175,55,0.18)]" />
        <div className="absolute top-[55%] left-[12%] w-1 h-1 rounded-full bg-[rgba(212,175,55,0.14)]" />
        <div className="absolute top-[72%] right-[20%] w-1.5 h-1.5 rounded-full bg-[rgba(212,175,55,0.12)]" />

        {decorativePills.map((pill, i) => (
          <motion.div
            key={`pill-${pill.x}-${pill.y}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: pill.opacity, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
            className="absolute"
            style={{ left: pill.x, top: pill.y }}
          >
            <motion.div
              animate={{
                y: [0, -2, 0, 1.5, 0],
                rotate: [pill.rotate, pill.rotate + 1, pill.rotate, pill.rotate - 0.5, pill.rotate],
              }}
              transition={{
                delay: 0.5 + i * 0.3,
                duration: 6 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div
                className="relative overflow-hidden rounded-full border border-[rgba(255,255,255,0.9)] shadow-[0_10px_24px_rgba(20,20,30,0.16)]"
                style={{
                  width: pill.w,
                  height: pill.h,
                  transform: `rotate(${pill.rotate}deg)`,
                  background: 'linear-gradient(132deg, #f4f5f9 0%, #d6dae5 48%, #bac0ce 100%)',
                }}
              >
                <div className="absolute inset-[1px] rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.08))]" />
                <div
                  className="absolute inset-y-[22%] left-[56%] w-[28%] rounded-full bg-[rgba(125,132,146,0.24)]"
                  style={{ filter: 'blur(0.4px)' }}
                />
              </div>
            </motion.div>
          </motion.div>
        ))}

        {bgPolaroids.map((pol) => (
          <motion.div
            key={`bgpol-${pol.src}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: pol.opacity, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="absolute"
            style={{ left: pol.x, top: pol.y }}
          >
            <div
              className="bg-white rounded-[1px] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              style={{
                width: pol.size,
                padding: '2px 2px 8px 2px',
                transform: `rotate(${pol.rotate}deg)`,
              }}
            >
              <div className="relative overflow-hidden rounded-[0.5px]" style={{ width: pol.size - 4, height: pol.size - 4 }}>
                <Image src={pol.src} alt="" fill className="object-cover" sizes={`${pol.size}px`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Header />

      <div className="flex-1 overflow-y-auto overscroll-none relative">
        <div className="px-5 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[480px] mx-auto rounded-[28px] border border-[rgba(255,255,255,0.74)] bg-white/72 backdrop-blur-sm px-5 py-5 shadow-[0_16px_34px_rgba(20,20,26,0.1)] mb-5 overflow-hidden"
          >
            <div className="absolute -right-8 -top-6 w-[110px] h-[55px] rotate-[18deg] opacity-30">
              <Image src="/images/capsule-closed-nobg.png" alt="" fill className="object-cover" sizes="110px" />
            </div>
            <h1 className="text-3xl font-semibold text-nuclea-text text-center mt-1 mb-1">
              Elige tu cápsula
            </h1>
            <p className="text-base text-nuclea-text-muted text-center mb-0">
              {creating ? 'Creando tu cápsula...' : 'Aquí guardas lo que no quieres perder'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: creating ? 0.5 : 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[480px] mx-auto rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.7)] bg-white/85 backdrop-blur-sm shadow-[0_14px_28px_rgba(18,18,24,0.08)]"
            style={{ pointerEvents: creating ? 'none' : 'auto' }}
          >
            {CAPSULE_TYPES.map((type, i) => (
              <CapsuleTypeCard
                key={type.id}
                capsuleType={type}
                onClick={handleSelect}
                isFirst={i === 0}
                isLast={i === CAPSULE_TYPES.length - 1}
              />
            ))}
          </motion.div>
        </div>

        <div className="safe-bottom" />
      </div>
    </div>
  )
}
