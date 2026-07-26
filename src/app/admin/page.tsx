'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HOLIDAY_CENTRAL_VALUES } from '@/lib/holidayCentral'

interface Signup {
  id: string
  date: string
  location: string
  name: string
  email: string
  phone: string
  bringing: string
  notes: string | null
  cancelled: boolean
  createdAt: string
}

interface Story {
  id: string
  title: string
  content: string
  imageUrl: string | null
  active: boolean
}

interface Volunteer {
  id: string
  name: string
  email: string
  phone: string
  townCity: string
  signupType: string
  groupName: string | null
  interests: string[]
  otherInterest: string | null
  availability: string | null
  hearAbout: string | null
  additionalInfo: string | null
  submittedAt: string
}

interface Application {
  id: string
  fullName: string
  streetAddress: string
  townCity: string
  state: string
  zip: string
  email: string
  phone: string
  emergencyName: string
  emergencyRelationship: string
  emergencyPhone: string
  tier: string
  roles: string[]
  tier4Applied: boolean
  priorExperience: string | null
  specialTraining: string | null
  communityService: string | null
  reference1Name: string
  reference1Phone: string
  reference1Email: string
  reference2Name: string
  reference2Phone: string
  reference2Email: string
  agreeConduct: boolean
  agreeConfidentiality: boolean
  agreeResidentGuidelines: boolean
  agreeMandatedReporter: boolean
  attestHealth: boolean
  signature: string
  signedAt: string
  submittedAt: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [signups, setSignups] = useState<Signup[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [activeTab, setActiveTab] = useState<'signups' | 'stories' | 'volunteers' | 'applications'>('signups')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // New story form
  const [newStory, setNewStory] = useState({ title: '', content: '', imageUrl: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [signupsRes, storiesRes, volunteersRes, applicationsRes] = await Promise.all([
        fetch('/api/signups'),
        fetch('/api/stories'),
        fetch('/api/volunteer'),
        fetch('/api/volunteer/apply'),
      ])

      const signupsData = await signupsRes.json()
      const storiesData = await storiesRes.json()
      const volunteersData = await volunteersRes.json()
      const applicationsData = await applicationsRes.json()

      setSignups(Array.isArray(signupsData) ? signupsData : [])
      setStories(Array.isArray(storiesData) ? storiesData : [])
      setVolunteers(Array.isArray(volunteersData) ? volunteersData : [])
      setApplications(Array.isArray(applicationsData) ? applicationsData : [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const addStory = async () => {
    if (!newStory.title || !newStory.content) {
      alert('Title and content are required')
      return
    }

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStory),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'Unauthorized') {
          router.push('/admin/login')
          return
        }
        throw new Error(data.error)
      }

      setNewStory({ title: '', content: '', imageUrl: '' })
      loadData()
    } catch (error) {
      console.error('Failed to add story:', error)
      alert('Failed to add story')
    }
  }

  const deleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return

    try {
      const response = await fetch(`/api/stories?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'Unauthorized') {
          router.push('/admin/login')
          return
        }
      }

      loadData()
    } catch (error) {
      console.error('Failed to delete story:', error)
    }
  }

  const changeLocation = async (id: string, location: string) => {
    try {
      const response = await fetch('/api/signups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, location }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'Unauthorized') {
          router.push('/admin/login')
          return
        }
        throw new Error(data.error)
      }

      setSignups((prev) =>
        prev.map((s) => (s.id === id ? { ...s, location } : s))
      )
    } catch (error) {
      console.error('Failed to change location:', error)
      alert('Failed to change location')
    }
  }

  const cancelSignup = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this sign-up?')) return

    try {
      const response = await fetch(`/api/signups?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.error === 'Unauthorized') {
          router.push('/admin/login')
          return
        }
        throw new Error(data.error)
      }

      loadData()
    } catch (error) {
      console.error('Failed to cancel signup:', error)
      alert('Failed to cancel sign-up')
    }
  }

  const exportCSV = () => {
    window.open('/api/export', '_blank')
  }

  const upcomingSignups = signups
    .filter((s) => !s.cancelled && new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredSignups = normalizedQuery
    ? upcomingSignups.filter(
        (s) =>
          s.name.toLowerCase().includes(normalizedQuery) ||
          s.email.toLowerCase().includes(normalizedQuery)
      )
    : upcomingSignups

  // Group upcoming signups by date
  const signupsByDate: Record<string, Signup[]> = {}
  for (const signup of filteredSignups) {
    const dateStr = new Date(signup.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    if (!signupsByDate[dateStr]) signupsByDate[dateStr] = []
    signupsByDate[dateStr].push(signup)
  }

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#e31837] border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-[#e31837] transition"
          >
            Sign Out
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-[#e31837]">{upcomingSignups.length}</p>
            <p className="text-gray-600 text-sm">Upcoming Meals</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-[#e31837]">
              {signups.filter((s) => !s.cancelled).length}
            </p>
            <p className="text-gray-600 text-sm">Total Sign-ups</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-[#e31837]">{stories.length}</p>
            <p className="text-gray-600 text-sm">Active Stories</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('signups')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'signups'
                ? 'text-[#e31837] border-b-2 border-[#e31837]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Meals
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'stories'
                ? 'text-[#e31837] border-b-2 border-[#e31837]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Impact Stories
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'volunteers'
                ? 'text-[#e31837] border-b-2 border-[#e31837]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Volunteer Interest
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'applications'
                ? 'text-[#e31837] border-b-2 border-[#e31837]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Volunteer Applications
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'signups' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upcoming Meals</h2>
              <button onClick={exportCSV} className="btn-primary text-sm py-2">
                Export CSV
              </button>
            </div>

            <div className="mb-4">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email…"
                className="form-input"
              />
            </div>

            {upcomingSignups.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">
                No upcoming meals scheduled
              </div>
            ) : filteredSignups.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">
                No sign-ups match &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(signupsByDate).map(([dateStr, dateSignups]) => (
                  <div key={dateStr}>
                    <h3 className="font-semibold text-[#e31837] text-lg mb-3">{dateStr}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {dateSignups.map((signup) => (
                        <div key={signup.id} className="card">
                          <div className="flex items-center justify-between mb-2">
                            <select
                              value={signup.location}
                              onChange={(e) => changeLocation(signup.id, e.target.value)}
                              className="text-xs font-semibold px-2 py-1 rounded border border-[#e31837]/30 bg-[#e31837]/10 text-[#e31837] cursor-pointer"
                            >
                              <option value="Brick Building">Brick Building</option>
                              <option value="Yellow Farmhouse">Yellow Farmhouse</option>
                            </select>
                            <button
                              onClick={() => cancelSignup(signup.id)}
                              className="text-red-500 hover:text-red-700 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                          <p className="font-medium text-lg">{signup.name}</p>
                          <p className="text-gray-600">{signup.bringing}</p>
                          <div className="text-sm text-gray-500 mt-2">
                            <p>{signup.email}</p>
                            <p>{signup.phone}</p>
                          </div>
                          {signup.notes && (
                            <p className="mt-2 text-sm text-gray-500 italic">
                              Note: {signup.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stories' && (
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Add New Story</h2>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newStory.title}
                    onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
                    placeholder="Story title"
                  />
                </div>
                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={newStory.content}
                    onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
                    placeholder="Tell the story..."
                  />
                </div>
                <div>
                  <label className="form-label">Image URL (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newStory.imageUrl}
                    onChange={(e) => setNewStory({ ...newStory, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <button onClick={addStory} className="btn-primary">
                  Add Story
                </button>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Current Stories</h2>
            {stories.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">
                No stories yet. Add one above!
              </div>
            ) : (
              <div className="space-y-4">
                {stories.map((story) => (
                  <div key={story.id} className="card">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{story.title}</h3>
                        <p className="text-gray-600 mt-1">{story.content}</p>
                        {story.imageUrl && (
                          <img
                            src={story.imageUrl}
                            alt={story.title}
                            className="mt-2 h-20 w-20 object-cover rounded"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => deleteStory(story.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'volunteers' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Volunteer Interest</h2>
              <p className="text-sm text-gray-500">{volunteers.length} submission{volunteers.length === 1 ? '' : 's'}</p>
            </div>

            {volunteers.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">
                No volunteer submissions yet
              </div>
            ) : (
              <div className="space-y-4">
                {volunteers.map((v) => {
                  const submitted = new Date(v.submittedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                  // Holiday Central selections live in the same interests array; split
                  // them out so they can be labeled separately.
                  const holidayInterests = v.interests.filter((i) => HOLIDAY_CENTRAL_VALUES.includes(i))
                  const generalInterests = v.interests.filter((i) => !HOLIDAY_CENTRAL_VALUES.includes(i))
                  return (
                    <div key={v.id} className="card">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                        <p className="font-semibold text-lg">{v.name}</p>
                        <p className="text-xs text-gray-500">{submitted}</p>
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-[9rem_1fr] gap-y-2 gap-x-3 text-sm">
                        <dt className="font-medium text-gray-600">Email</dt>
                        <dd className="text-gray-800 break-all">
                          <a href={`mailto:${v.email}`} className="text-[#e31837] underline">{v.email}</a>
                        </dd>

                        <dt className="font-medium text-gray-600">Phone</dt>
                        <dd className="text-gray-800">
                          <a href={`tel:${v.phone}`} className="text-[#e31837] underline">{v.phone}</a>
                        </dd>

                        <dt className="font-medium text-gray-600">Town / City</dt>
                        <dd className="text-gray-800">{v.townCity}</dd>

                        <dt className="font-medium text-gray-600">Signing up as</dt>
                        <dd className="text-gray-800">
                          {v.signupType}
                          {v.groupName && <span className="text-gray-600"> &mdash; {v.groupName}</span>}
                        </dd>

                        <dt className="font-medium text-gray-600">Interests</dt>
                        <dd className="text-gray-800">
                          {generalInterests.length === 0 ? (
                            <span className="text-gray-400 italic">(none selected)</span>
                          ) : (
                            <ul className="list-disc pl-5 space-y-0.5">
                              {generalInterests.map((i) => (
                                <li key={i}>
                                  {i}
                                  {i === 'Other' && v.otherInterest && (
                                    <span className="text-gray-600">: {v.otherInterest}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </dd>

                        {holidayInterests.length > 0 && (
                          <>
                            <dt className="font-medium text-gray-600">&#10052; Holiday Central</dt>
                            <dd className="text-gray-800">
                              <ul className="list-disc pl-5 space-y-0.5">
                                {holidayInterests.map((i) => (
                                  <li key={i}>{i}</li>
                                ))}
                              </ul>
                            </dd>
                          </>
                        )}

                        {v.availability && (
                          <>
                            <dt className="font-medium text-gray-600">Availability</dt>
                            <dd className="text-gray-800 whitespace-pre-wrap">{v.availability}</dd>
                          </>
                        )}

                        {v.hearAbout && (
                          <>
                            <dt className="font-medium text-gray-600">Heard about us</dt>
                            <dd className="text-gray-800 whitespace-pre-wrap">{v.hearAbout}</dd>
                          </>
                        )}

                        {v.additionalInfo && (
                          <>
                            <dt className="font-medium text-gray-600">Notes</dt>
                            <dd className="text-gray-800 whitespace-pre-wrap">{v.additionalInfo}</dd>
                          </>
                        )}
                      </dl>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Volunteer Applications</h2>
              <p className="text-sm text-gray-500">{applications.length} application{applications.length === 1 ? '' : 's'}</p>
            </div>

            {applications.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">
                No volunteer applications yet
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((a) => {
                  const submitted = new Date(a.submittedAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                  return (
                    <div key={a.id} className="card">
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                        <p className="font-semibold text-lg">
                          {a.fullName}
                          {(a.tier || (a.tier4Applied ? 'Tier 4' : '')) && (
                            <span className="ml-2 align-middle text-xs font-semibold px-2 py-0.5 rounded-full bg-[#e31837]/10 text-[#e31837]">
                              {a.tier || (a.tier4Applied ? 'Tier 4' : 'Tier 3')}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{submitted}</p>
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-[11rem_1fr] gap-y-2 gap-x-3 text-sm">
                        <dt className="font-medium text-gray-600">Email</dt>
                        <dd className="text-gray-800 break-all">
                          <a href={`mailto:${a.email}`} className="text-[#e31837] underline">{a.email}</a>
                        </dd>

                        <dt className="font-medium text-gray-600">Phone</dt>
                        <dd className="text-gray-800">
                          <a href={`tel:${a.phone}`} className="text-[#e31837] underline">{a.phone}</a>
                        </dd>

                        <dt className="font-medium text-gray-600">Address</dt>
                        <dd className="text-gray-800">{a.streetAddress}, {a.townCity}, {a.state} {a.zip}</dd>

                        <dt className="font-medium text-gray-600">Emergency contact</dt>
                        <dd className="text-gray-800">
                          {a.emergencyName} ({a.emergencyRelationship}) &mdash; {a.emergencyPhone}
                        </dd>

                        {a.priorExperience && (
                          <>
                            <dt className="font-medium text-gray-600">Prior experience</dt>
                            <dd className="text-gray-800 whitespace-pre-wrap">{a.priorExperience}</dd>
                          </>
                        )}
                        {a.specialTraining && (
                          <>
                            <dt className="font-medium text-gray-600">Special training / hobby</dt>
                            <dd className="text-gray-800 whitespace-pre-wrap">{a.specialTraining}</dd>
                          </>
                        )}
                        {a.communityService && (
                          <>
                            <dt className="font-medium text-gray-600">Community service</dt>
                            <dd className="text-gray-800 whitespace-pre-wrap">{a.communityService}</dd>
                          </>
                        )}

                        <dt className="font-medium text-gray-600">Reference 1</dt>
                        <dd className="text-gray-800">
                          {a.reference1Name} &mdash; {a.reference1Phone} &mdash;{' '}
                          <a href={`mailto:${a.reference1Email}`} className="text-[#e31837] underline break-all">{a.reference1Email}</a>
                        </dd>

                        <dt className="font-medium text-gray-600">Reference 2</dt>
                        <dd className="text-gray-800">
                          {a.reference2Name} &mdash; {a.reference2Phone} &mdash;{' '}
                          <a href={`mailto:${a.reference2Email}`} className="text-[#e31837] underline break-all">{a.reference2Email}</a>
                        </dd>

                        <dt className="font-medium text-gray-600">Acknowledgments</dt>
                        <dd className="text-gray-800">
                          <ul className="space-y-0.5">
                            <li>{a.agreeConduct ? '✓' : '✗'} Conduct Standards</li>
                            <li>{a.agreeConfidentiality ? '✓' : '✗'} Confidentiality statute</li>
                            <li>{a.agreeResidentGuidelines ? '✓' : '✗'} Resident Guidelines</li>
                            <li>{a.agreeMandatedReporter ? '✓' : '✗'} Mandated Reporter</li>
                            {a.tier === 'Tier 3' && (
                              <li>{a.attestHealth ? '✓' : '✗'} Health self-attestation</li>
                            )}
                          </ul>
                        </dd>

                        <dt className="font-medium text-gray-600">Signature</dt>
                        <dd className="text-gray-800">
                          {a.signature}
                          <span className="text-gray-500"> — {new Date(a.signedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </dd>
                      </dl>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
