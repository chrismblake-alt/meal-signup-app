'use client'

import { useState } from 'react'
import PhotoCarousel, { type PhotoItem } from '@/components/PhotoCarousel'

const VOLUNTEER_PHOTOS: PhotoItem[] = [
  { src: '/photos/volunteer1.jpg' },
  { src: '/photos/volunteer2.jpg', objectPosition: 'center top' },
  { src: '/photos/volunteer3.jpg', objectPosition: 'center 40%' },
  { src: '/photos/volunteer4.jpg', objectPosition: 'center 35%' },
  { src: '/photos/volunteer5.jpg', objectPosition: 'center 30%' },
]

const THANK_YOU_PHOTO = '/photos/volunteer3.jpg'

const INTEREST_GROUPS = [
  {
    heading: 'Tier 1 — Support Our Mission',
    note: 'Help power everything we do — no shelter visits required. We’ll set up a meeting with someone from our Development Team to see where you’ll be a great fit.',
    items: [
      { value: 'Special Events & Advocacy', label: 'Special Events & Advocacy', description: 'Join an event committee for our fundraising events, or represent us out in the community.' },
      { value: 'Collections & Drives', label: 'Collections & Drives', description: 'Help gather essentials like food, clothing and toiletries, or sponsor a child’s holiday wish list.' },
      { value: 'Event Volunteers', label: 'Event Volunteers', description: 'Lend a hand at our fundraising and community events.' },
    ],
  },
  {
    heading: 'Tier 2 — Make a Direct Impact',
    note: 'Directly brighten our kids’ days — prepared at home and dropped off, no direct interaction with the children. Someone from our Volunteer Team will meet with you to find the best fit and arrange drop-offs.',
    items: [
      { value: 'Dinner Donation', label: 'Dinner Donation', description: 'Cook a hearty meal for 10 of our residents at your house and drop it off. Perfect for families and groups.' },
      { value: 'Stuff a Sports Duffle', label: 'Stuff a Sports Duffle', description: 'Gather sports gear in a bag for kids to enjoy (teen sizes are super helpful).' },
      { value: 'Create an Activity Box', label: 'Create an Activity Box', description: 'Pack a box with craft supplies for 10 lucky children and teens.' },
      { value: 'Share the Love Basket', label: 'Share the Love Basket', description: 'Assemble a basket of necessities for shelter residents to celebrate special occasions.' },
      { value: 'Facility Upkeep', label: 'Facility Upkeep', description: 'Organizing, painting, gardening, or group project days while the kids are at school.' },
    ],
  },
  {
    heading: 'Tier 3 — Engage with the Kids',
    note: 'This one is so fulfilling! Because these roles involve engaging with our kids — even under staff supervision — we’re required to vet these volunteers more carefully.',
    items: [
      { value: 'Cook a Meal with our Kids', label: 'Cook a Meal with our Kids', description: 'Come to the shelter and cook dinner alongside our residents.' },
      { value: 'Garden with our Kids', label: 'Garden with our Kids', description: 'Dig in the dirt and garden side by side with our kids.' },
      { value: 'Help our Kids with Homework', label: 'Help our Kids with Homework', description: 'Support our kids and teens with homework and schoolwork.' },
      { value: 'Outdoor Fun with our Kids', label: 'Outdoor Fun with our Kids', description: 'When the weather warms up, host a BBQ or a game of volleyball!' },
      { value: 'Activities with Residents', label: 'Activities with Residents', description: 'Sponsor and join an excursion out of the shelter — a bowling alley, pottery studio, or museum.' },
    ],
  },
  {
    heading: 'Tier 4 — Lead Our Programs',
    note: 'Our highest level of volunteering — leading programs where you may work with kids with less direct supervision. These roles require our most thorough vetting.',
    items: [
      { value: 'Lighthouse Facilitator or Coordinator', label: 'Lighthouse Facilitator or Coordinator', description: 'Help lead weekly meetings where teens and their allies gather in a welcoming, inclusive, safe space.' },
      { value: 'SafeTalk Volunteer', label: 'SafeTalk Volunteer', description: 'Help trained staff teach K–5 kids in local schools how to recognize and respond to unsafe situations.' },
    ],
  },
] as const

const TIER_REQUIREMENTS = [
  {
    heading: 'Tier 1 — Support Our Mission',
    requirements: [
      'Meet with and be approved by someone from the KIC Development Team',
    ],
  },
  {
    heading: 'Tier 2 — Make a Direct Impact',
    requirements: [
      'Meet with and be approved by someone from the KIC Volunteer Team',
    ],
  },
  {
    heading: 'Tier 3 — Engage with the Kids',
    requirements: [
      'Meet with and be approved by someone from the KIC Volunteer Team',
      'Completed application form',
      'References',
      'Conduct standards agreement',
      'Confidentiality agreement',
      'Training session',
    ],
  },
  {
    heading: 'Tier 4 — Lead Our Programs',
    requirements: [
      'Everything in Tier 3',
      'Background checks (DCF CPS + CT criminal history)',
      'Mandated reporter acknowledgment',
      'Self-attestation of general good health',
    ],
  },
] as const

const OTHER_INTEREST = 'Other'

export default function VolunteerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    townCity: '',
    signupType: '',
    groupName: '',
    interests: [] as string[],
    otherInterest: '',
    availability: '',
    hearAbout: '',
    additionalInfo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const toggleInterest = (value: string) => {
    setFormData((prev) => {
      const has = prev.interests.includes(value)
      return {
        ...prev,
        interests: has ? prev.interests.filter((v) => v !== value) : [...prev.interests, value],
        otherInterest: value === OTHER_INTEREST && has ? '' : prev.otherInterest,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name || !formData.email || !formData.phone || !formData.townCity) {
      setError('Please fill in all required fields')
      return
    }

    if (!formData.signupType) {
      setError('Please tell us if you are signing up as an individual or a group')
      return
    }

    if (formData.signupType === 'Group' && !formData.groupName.trim()) {
      setError('Please tell us the name of your group')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          groupName: formData.signupType === 'Group' ? formData.groupName.trim() : null,
          otherInterest: formData.interests.includes(OTHER_INTEREST) ? formData.otherInterest.trim() : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setShowSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showOtherBox = formData.interests.includes(OTHER_INTEREST)
  const showGroupName = formData.signupType === 'Group'

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Join Our Volunteer Family
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every little bit of your time can create big ripples of change in the lives of children and teens in need. Tell us a bit about yourself and our volunteer team will be in touch.
          </p>
        </div>

        {showSuccess ? (
          <>
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg aspect-[4/3] md:aspect-[21/9]">
              <img
                src={THANK_YOU_PHOTO}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center 40%' }}
              />
            </div>
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-5xl mb-4">&#10003;</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Thank You!</h2>
              <p className="text-green-700">
                Jennifer Febles, our Manager of Early Childhood Support Programs &amp; Volunteers, will be in touch soon.
              </p>
            </div>
          </>
        ) : (
          <>
          <div className="mb-8">
            <PhotoCarousel photos={VOLUNTEER_PHOTOS} alt="Kids In Crisis volunteers" />
          </div>
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  required
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="email" className="form-label">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  required
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="phone" className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  required
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="townCity" className="form-label">Town / City *</label>
                <input
                  type="text"
                  id="townCity"
                  required
                  className="form-input"
                  value={formData.townCity}
                  onChange={(e) => setFormData({ ...formData, townCity: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Are you signing up as an individual or with a group? *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Individual', 'Group'] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`p-3 rounded-lg border-2 text-center cursor-pointer transition ${
                        formData.signupType === opt
                          ? 'border-[#e31837] bg-[#e31837]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="signupType"
                        value={opt}
                        checked={formData.signupType === opt}
                        onChange={(e) => setFormData({ ...formData, signupType: e.target.value })}
                        className="sr-only"
                      />
                      <span className="font-semibold text-sm">{opt}</span>
                    </label>
                  ))}
                </div>
                {showGroupName && (
                  <div className="mt-3">
                    <label htmlFor="groupName" className="form-label">Group Name *</label>
                    <input
                      type="text"
                      id="groupName"
                      className="form-input"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      placeholder="Company, church, school, etc."
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">What type of volunteering interests you? Check all that apply</label>
                <div className="space-y-6">
                  {INTEREST_GROUPS.map((group) => (
                    <div key={group.heading}>
                      <p className="font-bold text-gray-800 mb-1">{group.heading}</p>
                      {'note' in group && group.note && (
                        <p className="text-xs text-gray-500 italic mb-2">{group.note}</p>
                      )}
                      <div className="space-y-2">
                        {group.items.map((item) => (
                          <label
                            key={item.value}
                            className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition"
                          >
                            <input
                              type="checkbox"
                              checked={formData.interests.includes(item.value)}
                              onChange={() => toggleInterest(item.value)}
                              className="accent-[#e31837] mt-1"
                            />
                            <span className="text-sm">
                              <span className="font-medium">{item.label}</span>
                              <span className="text-gray-600"> &mdash; {item.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div>
                    <p className="font-bold text-gray-800 mb-2">Something else</p>
                    <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(OTHER_INTEREST)}
                        onChange={() => toggleInterest(OTHER_INTEREST)}
                        className="accent-[#e31837] mt-1"
                      />
                      <span className="text-sm font-medium">Other</span>
                    </label>
                    {showOtherBox && (
                      <input
                        type="text"
                        className="form-input mt-3"
                        value={formData.otherInterest}
                        onChange={(e) => setFormData({ ...formData, otherInterest: e.target.value })}
                        placeholder="Tell us what you have in mind"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-gray-700 mb-3">What each tier involves</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TIER_REQUIREMENTS.map((tier) => (
                    <div
                      key={tier.heading}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                    >
                      <p className="font-bold text-gray-800 mb-2">{tier.heading}</p>
                      <ul className="space-y-1.5 text-sm text-gray-600">
                        {tier.requirements.map((req) => (
                          <li key={req} className="flex items-start gap-2">
                            <span className="text-[#e31837] mt-0.5" aria-hidden="true">&#10003;</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="availability" className="form-label">
                  What days and times are you generally available?
                </label>
                <textarea
                  id="availability"
                  rows={2}
                  className="form-input"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="hearAbout" className="form-label">
                  How did you hear about Kids In Crisis?
                </label>
                <textarea
                  id="hearAbout"
                  rows={2}
                  className="form-input"
                  value={formData.hearAbout}
                  onChange={(e) => setFormData({ ...formData, hearAbout: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="additionalInfo" className="form-label">
                  Anything else you&rsquo;d like us to know?
                </label>
                <textarea
                  id="additionalInfo"
                  rows={3}
                  className="form-input"
                  value={formData.additionalInfo}
                  onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
          </>
        )}
      </div>
    </div>
  )
}
