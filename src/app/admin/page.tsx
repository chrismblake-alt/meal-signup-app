'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [signups, setSignups] = useState<Signup[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [activeTab, setActiveTab] = useState<'signups' | 'stories'>('signups')
  const [loading, setLoading] = useState(true)

  // New story form
  const [newStory, setNewStory] = useState({ title: '', content: '', imageUrl: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [signupsRes, storiesRes] = await Promise.all([
        fetch('/api/signups'),
        fetch('/api/stories'),
      ])

      const signupsData = await signupsRes.json()
      const storiesData = await storiesRes.json()

      setSignups(Array.isArray(signupsData) ? signupsData : [])
      setStories(Array.isArray(storiesData) ? storiesData : [])
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

  const exportCSV = () => {
    window.open('/api/export', '_blank')
  }

  const upcomingSignups = signups
    .filter((s) => !s.cancelled && new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  // Group upcoming signups by date
  const signupsByDate: Record<string, Signup[]> = {}
  for (const signup of upcomingSignups) {
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

            {upcomingSignups.length === 0 ? (
              <div className="card text-center text-gray-500 py-8">
                No upcoming meals scheduled
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(signupsByDate).map(([dateStr, dateSignups]) => (
                  <div key={dateStr}>
                    <h3 className="font-semibold text-[#e31837] text-lg mb-3">{dateStr}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {dateSignups.map((signup) => (
                        <div key={signup.id} className="card">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block bg-[#e31837]/10 text-[#e31837] text-xs font-semibold px-2 py-1 rounded">
                              {signup.location}
                            </span>
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
      </div>
    </div>
  )
}
