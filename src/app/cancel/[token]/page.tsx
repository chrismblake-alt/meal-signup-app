'use client'

import { useState, useEffect, use } from 'react'

interface Signup {
  id: string
  name: string
  date: string
  bringing: string
  cancelled: boolean
}

export default function CancelPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [signup, setSignup] = useState<Signup | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/signups/cancel?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setSignup(data)
          if (data.cancelled) {
            setCancelled(true)
          }
        }
      })
      .catch(() => setError('Failed to load signup details'))
      .finally(() => setLoading(false))
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const response = await fetch(`/api/signups/cancel?token=${token}`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setCancelled(true)
      }
    } catch {
      setError('Failed to cancel signup')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#e31837] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto card text-center">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <a href="/" className="btn-primary inline-block mt-6">
            Return Home
          </a>
        </div>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="py-16 px-4">
        <div className="max-w-md mx-auto card text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Cancelled</h1>
          <p className="text-gray-600">
            Your meal sign-up has been cancelled. Thank you for letting us know.
          </p>
          <a href="/" className="btn-primary inline-block mt-6">
            Sign Up for Another Date
          </a>
        </div>
      </div>
    )
  }

  const formattedDate = signup
    ? new Date(signup.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="py-16 px-4">
      <div className="max-w-md mx-auto card">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          Cancel Your Sign-Up
        </h1>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Name</p>
          <p className="font-medium">{signup?.name}</p>

          <p className="text-sm text-gray-500 mb-1 mt-3">Date</p>
          <p className="font-medium">{formattedDate}</p>

          <p className="text-sm text-gray-500 mb-1 mt-3">Bringing</p>
          <p className="font-medium">{signup?.bringing}</p>
        </div>

        <p className="text-gray-600 mb-6 text-center">
          Are you sure you want to cancel this meal sign-up?
        </p>

        <div className="flex gap-4">
          <a
            href="/"
            className="flex-1 py-3 px-4 border border-gray-300 rounded-full text-center font-medium hover:bg-gray-50 transition"
          >
            Keep Sign-Up
          </a>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 btn-primary"
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}
