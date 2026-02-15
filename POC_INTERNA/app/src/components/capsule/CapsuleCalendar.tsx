'use client'

import { useState } from 'react'
import type { MediaItem } from '@/types/media'
import { ImageIcon, Video, Mic, FileText } from 'lucide-react'

interface CapsuleCalendarProps {
  items: MediaItem[]
  onSelectDate: (date: Date) => void
  selectedDate: Date | null
}

interface DayContentProps {
  date: Date
  items: MediaItem[]
}

// Spanish month names
const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

// Spanish day initials (Monday to Sunday)
const DAY_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function DayContent({ date, items }: DayContentProps) {
  const formatDate = (d: Date) => {
    const day = d.getDate()
    const month = MONTH_NAMES[d.getMonth()]
    const year = d.getFullYear()
    return `${day} de ${month} de ${year}`
  }

  const getTypeIcon = (type: MediaItem['type']) => {
    const iconClass = "w-4 h-4"
    switch (type) {
      case 'photo': return <ImageIcon className={iconClass} />
      case 'video': return <Video className={iconClass} />
      case 'audio': return <Mic className={iconClass} />
      case 'note': return <FileText className={iconClass} />
    }
  }

  const getTypeLabel = (type: MediaItem['type']) => {
    switch (type) {
      case 'photo': return 'Foto'
      case 'video': return 'Vídeo'
      case 'audio': return 'Audio'
      case 'note': return 'Nota'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="mt-6 border-t border-nuclea-border pt-4">
      <h3 className="text-sm font-semibold text-nuclea-text mb-3">
        {formatDate(date)}
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-nuclea-text-muted text-center py-4">
          No hay contenido este día
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-nuclea-bg-secondary hover:bg-gray-50 transition-colors"
            >
              <div className="text-nuclea-text-secondary">
                {getTypeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nuclea-text truncate">
                  {item.name}
                </p>
                <p className="text-xs text-nuclea-text-secondary">
                  {getTypeLabel(item.type)}
                </p>
              </div>
              <span className="text-xs text-nuclea-text-muted">
                {formatTime(item.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function CapsuleCalendar({ items, onSelectDate, selectedDate }: CapsuleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get items grouped by date
  const itemsByDate = items.reduce((acc, item) => {
    const dateKey = new Date(item.createdAt).toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {} as Record<string, MediaItem[]>)

  // Get calendar grid for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of month (0 = Monday in Spain)
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Convert Sunday=0 to Monday=0

    // Days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Build grid
    const days: (Date | null)[] = []

    // Empty cells before first day
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const days = getCalendarDays()

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const handleDayClick = (date: Date) => {
    onSelectDate(date)
  }

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false
    return d1.toDateString() === d2.toDateString()
  }

  const getContentDots = (date: Date) => {
    const dateKey = date.toDateString()
    const dayItems = itemsByDate[dateKey] || []

    if (dayItems.length === 0) return null

    const types = new Set(dayItems.map(item => item.type))

    return (
      <div className="flex gap-1 justify-center mt-0.5">
        {types.has('photo') && (
          <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
        )}
        {(types.has('audio') || types.has('video')) && (
          <div className="w-1 h-1 rounded-full bg-red-500" />
        )}
        {types.has('note') && (
          <div className="w-1 h-1 rounded-full bg-blue-500" />
        )}
      </div>
    )
  }

  const hasContent = items.length > 0
  const selectedDayItems = selectedDate
    ? itemsByDate[selectedDate.toDateString()] || []
    : []

  return (
    <div className="bg-white border border-nuclea-border rounded-2xl p-4">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-nuclea-bg-secondary rounded-full transition-colors"
          aria-label="Mes anterior"
        >
          <svg className="w-5 h-5 text-nuclea-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 className="text-base font-semibold text-nuclea-text capitalize">
          {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-nuclea-bg-secondary rounded-full transition-colors"
          aria-label="Mes siguiente"
        >
          <svg className="w-5 h-5 text-nuclea-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day names row */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAY_INITIALS.map((day, i) => (
          <div key={i} className="text-center text-sm font-medium text-nuclea-text-secondary">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day ? (
              <button
                onClick={() => handleDayClick(day)}
                className={`
                  w-full h-full flex flex-col items-center justify-center rounded-full
                  transition-colors text-sm
                  ${isSameDay(day, today) ? 'bg-[#FFF9E6]' : ''}
                  ${isSameDay(day, selectedDate) ? 'bg-[#D4AF37] text-white' : 'text-nuclea-text'}
                  ${!isSameDay(day, selectedDate) && 'hover:bg-nuclea-bg-secondary'}
                `}
              >
                <span>{day.getDate()}</span>
                {!isSameDay(day, selectedDate) && getContentDots(day)}
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>

      {/* Empty state message */}
      {!hasContent && (
        <p className="text-sm text-nuclea-text-muted text-center mt-4 py-2">
          Añade tu primer recuerdo
        </p>
      )}

      {/* Selected day content */}
      {selectedDate && hasContent && (
        <DayContent date={selectedDate} items={selectedDayItems} />
      )}
    </div>
  )
}
