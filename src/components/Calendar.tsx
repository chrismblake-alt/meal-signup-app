'use client'

import { useState } from 'react'

interface CalendarProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  bookedDates: string[]
  blockedDates: string[]
  multiSelect?: boolean
  selectedDates?: Date[]
  onToggleDate?: (date: Date) => void
}

export default function Calendar({
  selectedDate,
  onSelectDate,
  bookedDates,
  blockedDates,
  multiSelect = false,
  selectedDates = [],
  onToggleDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const getDateStr = (date: Date) => date.toISOString().split('T')[0]

  const isBooked = (date: Date) => bookedDates.includes(getDateStr(date))

  const isDateBlocked = (date: Date) => {
    return blockedDates.includes(getDateStr(date))
  }

  const isDatePast = (date: Date) => {
    return date < today
  }

  const isSelected = (date: Date) => {
    if (multiSelect) {
      return selectedDates.some(d => d.toDateString() === date.toDateString())
    }
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (!isDatePast(date) && !isDateBlocked(date) && !isBooked(date)) {
      if (multiSelect && onToggleDate) {
        onToggleDate(date)
      } else {
        onSelectDate(date)
      }
    }
  }

  const renderDays = () => {
    const days = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10" />)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isPast = isDatePast(date)
      const isBlocked = isDateBlocked(date)
      const booked = isBooked(date)
      const selected = isSelected(date)
      const isUnavailable = isPast || isBlocked || booked

      let className = 'calendar-day '
      if (selected) {
        className += multiSelect ? 'multi-selected ' : 'selected '
      } else if (booked) {
        className += 'booked '
      }
      if (isPast || isBlocked) {
        className += 'disabled '
      }

      let title = 'Available'
      if (booked) title = 'Taken'
      else if (isBlocked) title = 'Not available'
      else if (isPast) title = 'Past date'

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          disabled={isUnavailable}
          className={className}
          title={title}
        >
          {day}
        </button>
      )
    }

    return days
  }

  return (
    <div className="card">
      {multiSelect && (
        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
          Click on any available dates to select them. You can pick as many as you&apos;d like.
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="font-semibold text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#16a34a]" />
          <span>{multiSelect ? 'Your selections' : 'Your selection'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#fecaca]" />
          <span>Taken</span>
        </div>
      </div>
    </div>
  )
}
