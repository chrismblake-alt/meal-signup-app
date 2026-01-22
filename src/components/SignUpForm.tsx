'use client'

import { useState } from 'react'

interface SignUpFormProps {
  selectedDate: Date | null
  onSuccess: () => void
}

export default function SignUpForm({ selectedDate, onSuccess }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bringing: '',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate) {
      setError('Please select a date first')
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
      setFormData({ name: '', email: '', phone: '', bringing: '', notes: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Sign Up to Provide a Meal</h2>

      {selectedDate ? (
        <div className="bg-[#e31837]/10 text-[#e31837] px-4 py-3 rounded-lg mb-4">
          <p className="font-medium">Selected Date:</p>
          <p className="text-lg">{formattedDate}</p>
        </div>
      ) : (
        <div className="bg-gray-100 text-gray-600 px-4 py-3 rounded-lg mb-4">
          <p>Please select a date from the calendar</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            Please include main dish, sides, and any desserts
          </p>
        </div>

        <div>
          <label htmlFor="notes" className="form-label">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="form-input"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any allergies to accommodate, special instructions, etc."
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedDate}
          className="btn-primary w-full"
        >
          {isSubmitting ? 'Signing Up...' : 'Sign Up for This Date'}
        </button>
      </form>
    </div>
  )
}
