'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import SignUpForm from '@/components/SignUpForm'
import SelectedDatesList from '@/components/SelectedDatesList'
import KidCount from '@/components/KidCount'
import StoryCarousel from '@/components/StoryCarousel'

interface Story {
  id: string
  title: string
  content: string
  imageUrl: string | null
}

interface Signup {
  id: string
  date: string
  location: string
  cancelled: boolean
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [signupMode, setSignupMode] = useState<'single' | 'multi' | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [signups, setSignups] = useState<Signup[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [successCount, setSuccessCount] = useState(0)

  useEffect(() => {
    fetch('/api/stories')
      .then((res) => res.json())
      .then((data) => setStories(data))
      .catch(console.error)

    fetch('/api/signups')
      .then((res) => res.json())
      .then((data) => setSignups(data))
      .catch(console.error)
  }, [])

  const refreshSignups = () => {
    fetch('/api/signups')
      .then((res) => res.json())
      .then((data) => setSignups(data))
      .catch(console.error)
  }

  const handleSingleSuccess = () => {
    setSuccessCount(1)
    setShowSuccess(true)
    setSelectedDate(null)
    setSignupMode(null)
    refreshSignups()
  }

  const handleMultiSuccess = (count: number) => {
    setSuccessCount(count)
    setShowSuccess(true)
    setSelectedDates([])
    setSignupMode(null)
    refreshSignups()
  }

  const handleModeChange = (mode: 'single' | 'multi') => {
    setSignupMode(mode)
    setSelectedDate(null)
    setSelectedDates([])
  }

  const handleToggleDate = (date: Date) => {
    setSelectedDates(prev => {
      const exists = prev.some(d => d.toDateString() === date.toDateString())
      if (exists) {
        return prev.filter(d => d.toDateString() !== date.toDateString())
      }
      return [...prev, date].sort((a, b) => a.getTime() - b.getTime())
    })
  }

  const handleRestart = () => {
    setShowSuccess(false)
    setSuccessCount(0)
    setSignupMode(null)
    setSelectedDate(null)
    setSelectedDates([])
  }

  // Build a map of dateStr -> taken location names
  const bookedLocations: Record<string, string[]> = {}
  for (const s of signups.filter((s) => !s.cancelled)) {
    const dateStr = new Date(s.date).toISOString().split('T')[0]
    if (!bookedLocations[dateStr]) bookedLocations[dateStr] = []
    if (!bookedLocations[dateStr].includes(s.location)) {
      bookedLocations[dateStr].push(s.location)
    }
  }

  // Get taken locations for selected date (single mode)
  const selectedDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : ''
  const takenLocations = selectedDateStr ? (bookedLocations[selectedDateStr] || []) : []

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Provide a Meal for Children in Need
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your home-cooked meal makes a difference. Sign up to provide dinner for the children staying at one of our two shelters.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-green-600 text-5xl mb-4">&#10003;</div>
            <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
            <p className="text-green-700">
              {successCount > 1
                ? `Your sign-ups for ${successCount} dates have been confirmed. Check your email for details and cancellation links for each date.`
                : 'Your sign-up has been confirmed. Check your email for details and a cancellation link.'}
            </p>
            <button
              onClick={handleRestart}
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
              <KidCount />
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left column: Form */}
              <div>
                <h2 className="text-xl font-semibold mb-4">1. Your Information</h2>
                <SignUpForm
                  selectedDate={selectedDate}
                  takenLocations={takenLocations}
                  onSuccess={handleSingleSuccess}
                  signupMode={signupMode}
                  onModeChange={handleModeChange}
                  selectedDates={selectedDates}
                  bookedLocations={bookedLocations}
                  onMultiSuccess={handleMultiSuccess}
                />
              </div>

              {/* Right column: Calendar + Date List */}
              <div>
                {signupMode === 'single' && (
                  <>
                    <h2 className="text-xl font-semibold mb-4">2. Select a Date</h2>
                    <Calendar
                      selectedDate={selectedDate}
                      onSelectDate={setSelectedDate}
                      bookedLocations={bookedLocations}
                      blockedDates={[]}
                    />
                  </>
                )}

                {signupMode === 'multi' && (
                  <>
                    <h2 className="text-xl font-semibold mb-4">2. Select Your Dates</h2>
                    <Calendar
                      selectedDate={null}
                      onSelectDate={() => {}}
                      bookedLocations={bookedLocations}
                      blockedDates={[]}
                      multiSelect={true}
                      selectedDates={selectedDates}
                      onToggleDate={handleToggleDate}
                    />
                    <div className="mt-4">
                      <SelectedDatesList
                        dates={selectedDates}
                        bookedLocations={bookedLocations}
                        onRemoveDate={handleToggleDate}
                      />
                    </div>
                  </>
                )}

                {!signupMode && (
                  <div className="card text-center py-12">
                    <p className="text-gray-500">
                      Fill in your information and choose single or multiple dates to see the calendar.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="card mb-8">
              <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-medium text-[#e31837] mb-2">When</h3>
                  <p className="text-gray-600">12:00 PM - 5:00 PM</p>
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
                  <h3 className="font-medium text-green-700 mb-2">What to Bring</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">&#10003;</span> A protein, starch, and veggies and/or salad</li>
                    <li className="flex items-start gap-2"><span className="text-green-600 font-bold mt-0.5">&#10003;</span> Plan for approximately 10 children</li>
                  </ul>
                  <h3 className="font-medium text-red-700 mt-4 mb-2">Please do NOT include</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold mt-0.5">&#10007;</span> Nuts or food containing nuts</li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold mt-0.5">&#10007;</span> Soda or desserts of any kind</li>
                    <li className="flex items-start gap-2"><span className="text-red-600 font-bold mt-0.5">&#10007;</span> Beverages, plates, or utensils</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 border-t pt-6">
                <h3 className="font-medium text-[#e31837] mb-2">Additional Instructions</h3>
                <ul className="text-gray-600 space-y-2 list-disc list-inside">
                  <li>Dinner Donors may either make the meal and drop it off or have it delivered from a local restaurant.</li>
                  <li>Please drop meals off in disposable containers that do not need to be returned.</li>
                  <li>
                    If you have any questions, call or email Kelly Phillips{' '}
                    <a href="mailto:kphillips@kidsincrisis.org" className="text-[#e31837] underline">kphillips@kidsincrisis.org</a>
                    {' '}or{' '}
                    <a href="tel:2036226556" className="text-[#e31837] underline">203-622-6556</a>
                  </li>
                </ul>
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
