'use client'

interface SelectedDatesListProps {
  dates: Date[]
  onRemoveDate: (date: Date) => void
}

export default function SelectedDatesList({ dates, onRemoveDate }: SelectedDatesListProps) {
  if (dates.length === 0) {
    return (
      <div className="card">
        <h3 className="font-semibold text-lg mb-3">Selected Dates</h3>
        <p className="text-gray-500 text-sm">
          No dates selected yet. Click dates on the calendar to add them.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-lg mb-3">
        Selected Dates ({dates.length})
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {dates.map((date) => {
          const dateStr = date.toISOString().split('T')[0]
          const formatted = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })

          return (
            <div
              key={dateStr}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
            >
              <p className="font-medium text-sm">{formatted}</p>
              <button
                onClick={() => onRemoveDate(date)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full w-7 h-7 flex items-center justify-center transition"
                title="Remove date"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
