'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import SignUpForm from '@/components/SignUpForm'
import KidCount from '@/components/KidCount'
import StoryCarousel from '@/components/StoryCarousel'

interface Settings {
  kidCountMin: number
  kidCountMax: number
}

interface Story {
  id: string
  title: string
  content: string
  imageUrl: string | null
}

interface Signup {
  id: string
  date: string
  cancelled: boolean
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [settings, setSettings] = useState<Settings>({ kidCountMin: 8, kidCountMax: 12 })
  const [stories, setStories] = useState<Story[]>([])
  const [signups, setSignups] = useState<Signup[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Fetch settings
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data))
      .catch(console.error)

    // Fetch stories
    fetch('/api/stories')
      .then((res) => res.json())
      .then((data) => setStories(data))
      .catch(console.error)

    // Fetch signups
    fetch('/api/signups')
      .then((res) => res.json())
      .then((data) => setSignups(data))
      .catch(console.error)
  }, [])

  const handleSuccess = () => {
    setShowSuccess(true)
    setSelectedDate(null)
    // Refresh signups
    fetch('/api/signups')
      .then((res) => res.json())
      .then((data) => setSignups(data))
      .catch(console.error)
  }

  const bookedDates = signups
    .filter((s) => !s.cancelled)
    .map((s) => new Date(s.date).toISOString().split('T')[0])

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Provide a Meal for Children in Need
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your home-cooked meal makes a difference. Sign up to provide dinner for the children staying at our shelter.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
            <p className="text-green-700">
              Your sign-up has been confirmed. Check your email for details and a cancellation link.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-4 text-green-600 hover:text-green-800 underline"
            >
              Sign up for another date
            </button>
          </div>
        )}

        {!showSuccess && (
          <>
            {/* Kid Count */}
            <div className="mb-8">
              <KidCount min={settings.kidCountMin} max={settings.kidCountMax} />
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Select a Date</h2>
                <Calendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  bookedDates={bookedDates}
                  blockedDates={[]}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">2. Complete Sign-Up</h2>
                <SignUpForm selectedDate={selectedDate} onSuccess={handleSuccess} />
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-[#e31837] mb-2">When</h3>
                  <p className="text-gray-600">5:00 PM - 6:00 PM</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#e31837] mb-2">Where</h3>
                  <p className="text-gray-600">
                    Kids In Crisis<br />
                    1 Salem Street<br />
                    Cos Cob, CT 06807
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-[#e31837] mb-2">What to Bring</h3>
                  <p className="text-gray-600">
                    A complete meal including main dish, sides, and optionally dessert. Plan for the current number of children shown above.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Impact Stories */}
        {stories.length > 0 && (
          <div className="mb-8">
            <StoryCarousel stories={stories} />
          </div>
        )}
      </div>
    </div>
  )
}
