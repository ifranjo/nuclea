'use client'

import { useState } from 'react'
import { CapsuleCalendar } from '@/components/capsule/CapsuleCalendar'
import type { MediaItem } from '@/types/media'

// Sample data for demo
const generateSampleItems = (): MediaItem[] => {
  const items: MediaItem[] = []
  const now = new Date()

  // Add items for current month
  for (let day = 1; day <= 28; day++) {
    const itemCount = ((day * 37) % 3) // 0-2 items per day

    for (let i = 0; i < itemCount; i++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day, 10 + i * 2, 30)
      const types: MediaItem['type'][] = ['photo', 'video', 'audio', 'note']
      const type = types[(day + i) % types.length]

      items.push({
        id: `item-${day}-${i}`,
        type,
        name: `${type === 'photo' ? 'Foto' : type === 'video' ? 'Vídeo' : type === 'audio' ? 'Audio' : 'Nota'} ${day}/${i + 1}`,
        url: '#',
        createdAt: date,
      })
    }
  }

  return items
}

export default function CalendarDemoPage() {
  const [items] = useState<MediaItem[]>(generateSampleItems())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  return (
    <div className="min-h-screen bg-nuclea-bg p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-nuclea-text mb-2">
          Calendario de Cápsula
        </h1>
        <p className="text-nuclea-text-secondary mb-6">
          Demo del componente de calendario temporal
        </p>

        <CapsuleCalendar
          items={items}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <div className="mt-6 p-4 bg-nuclea-bg-secondary rounded-xl">
          <h2 className="text-sm font-semibold text-nuclea-text mb-2">
            Estado actual
          </h2>
          <div className="text-sm text-nuclea-text-secondary space-y-1">
            <p>Total de elementos: {items.length}</p>
            <p>Fecha seleccionada: {selectedDate ? selectedDate.toLocaleDateString('es-ES') : 'Ninguna'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
