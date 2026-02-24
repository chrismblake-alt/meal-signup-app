'use client'

import { useState } from 'react'

const LOCATIONS = ['Brick Building', 'Yellow Farmhouse'] as const

interface SignUpFormProps {
  selectedDate: Date | null
  takenLocations: string[]
  onSuccess: () => void
  signupMode: 'single' | 'multi' | null
  onModeChange: (mode: 'single' | 'multi') => void
  selectedDates: Date[]
  onMultiSuccess: (count: number) => void
  kidCountDisplay: string
  multiLocation: string
  onMultiLocationChange: (location: string) => void
}

export default function SignUpForm({
  selectedDate,
  takenLocations,
  onSuccess,
  signupMode,
  onModeChange,
  selectedDates,
  onMultiSuccess,
  kidCountDisplay,
  multiLocation,
  onMultiLocationChange,
}: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bringing: '',
    notes: '',
    location: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const availableLocations = LOCATIONS.filter(l => !takenLocations.includes(l))

  const handleSingleSubmit = async () => {
    if (!selectedDate) {
      setError('Please select a date first')
      return
    }

    if (!formData.location) {
      setError('Please select a location')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: selectedDate.toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      onSuccess()
      setFormData({ name: '', email: '', phone: '', bringing: '', notes: '', location: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMultiSubmit = async () => {
    if (selectedDates.length === 0) {
      setError('Please select at least one date')
      return
    }

    if (!multiLocation) {
      setError('Please select a location')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/signups/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          bringing: formData.bringing,
          notes: formData.notes,
          location: multiLocation,
          dates: selectedDates.map(d => d.toISOString()),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      onMultiSuccess(selectedDates.length)
      setFormData({ name: '', email: '', phone: '', bringing: '', notes: '', location: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone || !formData.bringing) {
      setError('Please fill in all required fields')
      return
    }

    if (signupMode === 'multi') {
      await handleMultiSubmit()
    } else {
      await handleSingleSubmit()
    }
  }

  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const contactInfoFilled = formData.name && formData.email && formData.phone && formData.bringing

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sign Up to Provide a Meal</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact Info Section */}
        <div>
          <label htmlFor="name" className="form-label">
            Your Name *
          </label>
          <input
            type="text"
            id="name"
            required
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Smith"
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            required
            className="form-input"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            required
            className="form-input"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(203) 555-1234"
          />
        </div>

        <div>
          <label htmlFor="bringing" className="form-label">
            What are you bringing? *
          </label>
          <input
            type="text"
            id="bringing"
            required
            className="form-input"
            value={formData.bringing}
            onChange={(e) => setFormData({ ...formData, bringing: e.target.value })}
            placeholder="e.g., Pasta with meatballs, salad, and garlic bread"
          />
          <p className="text-sm text-gray-500 mt-1">
            Please include main dish and sides or the restaurant you are ordering from.
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="form-label">
            Anything else we should know?
          </label>
          <textarea
            id="notes"
            rows={3}
            className="form-input"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        {/* Mode Selection - shown after contact info is filled */}
        {contactInfoFilled && (
          <div>
            <label className="form-label">How would you like to sign up?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onModeChange('single')}
                className={`p-3 rounded-lg border-2 text-center transition ${
                  signupMode === 'single'
                    ? 'border-[#e31837] bg-[#e31837]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm">Single Date</p>
                <p className="text-xs text-gray-500 mt-1">Choose one date and location</p>
              </button>
              <button
                type="button"
                onClick={() => onModeChange('multi')}
                className={`p-3 rounded-lg border-2 text-center transition ${
                  signupMode === 'multi'
                    ? 'border-[#e31837] bg-[#e31837]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-sm">Multiple Dates</p>
                <p className="text-xs text-gray-500 mt-1">Pick several dates at one location</p>
              </button>
            </div>
          </div>
        )}

        {/* Single Date Mode - Date display and location selector */}
        {signupMode === 'single' && (
          <>
            {selectedDate ? (
              <div className="bg-[#e31837]/10 text-[#e31837] px-4 py-3 rounded-lg">
                <p className="font-medium">Selected Date:</p>
                <p className="text-lg">{formattedDate}</p>
              </div>
            ) : (
              <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-lg">
                <p>Please select a date from the calendar</p>
              </div>
            )}

            {selectedDate && (
              <div>
                <label className="form-label">Select Location *</label>
                {availableLocations.length === 0 ? (
                  <p className="text-red-600 text-sm">All locations are taken for this date.</p>
                ) : (
                  <div className="space-y-2">
                    {availableLocations.map(loc => (
                      <label key={loc} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="location"
                          value={loc}
                          checked={formData.location === loc}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="accent-[#e31837]"
                        />
                        <span className="font-medium">{loc}</span>
                      </label>
                    ))}
                  </div>
                )}
                {takenLocations.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Already taken: {takenLocations.join(', ')}
                  </p>
                )}
              </div>
            )}

            {formData.location && (
              <div className="bg-[#fff3cd] border-2 border-[#e31837] rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-800">Please prepare meals for approximately</p>
                <p className="text-3xl font-bold text-[#e31837] my-1">{kidCountDisplay} children</p>
                <p className="text-sm text-gray-600">at the {formData.location}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !selectedDate || !formData.location}
              className="btn-primary w-full"
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up for This Date'}
            </button>
          </>
        )}

        {/* Multi Date Mode - Location picker & submit button (calendar & date list rendered by parent) */}
        {signupMode === 'multi' && (
          <>
            <div>
              <label className="form-label">Select Location *</label>
              <div className="space-y-2">
                {LOCATIONS.map(loc => (
                  <label key={loc} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="radio"
                      name="multi-location"
                      value={loc}
                      checked={multiLocation === loc}
                      onChange={(e) => onMultiLocationChange(e.target.value)}
                      className="accent-[#e31837]"
                    />
                    <span className="font-medium">{loc}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                All selected dates will be signed up at this location.
              </p>
            </div>

            {multiLocation && selectedDates.length > 0 && (
              <div className="bg-[#fff3cd] border-2 border-[#e31837] rounded-lg p-4 text-center">
                <p className="font-semibold text-gray-800">Please prepare meals for approximately</p>
                <p className="text-3xl font-bold text-[#e31837] my-1">{kidCountDisplay} children</p>
                <p className="text-sm text-gray-600">per delivery at the {multiLocation}</p>
              </div>
            )}

            {formData.bringing && (
              <p className="text-sm text-gray-500">
                Your meal details will apply to all selected dates.
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || selectedDates.length === 0 || !multiLocation}
              className="btn-primary w-full"
            >
              {isSubmitting
                ? 'Signing Up...'
                : selectedDates.length === 0
                  ? 'Select dates from the calendar'
                  : `Sign Up for ${selectedDates.length} Date${selectedDates.length > 1 ? 's' : ''}`}
            </button>
          </>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </div>
  )
}
