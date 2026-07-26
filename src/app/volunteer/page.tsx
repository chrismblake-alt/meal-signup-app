'use client'

import { useState } from 'react'
import PhotoCarousel, { type PhotoItem } from '@/components/PhotoCarousel'
import { HOLIDAY_CENTRAL_INTERESTS } from '@/lib/holidayCentral'

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE FLAG: seasonal "Holiday Central" section.
// Flip to `false` in the off-season to hide the section entirely; `true` to show
// it. Before enabling for a new season, VERIFY the Amazon wishlist link and the
// drop-off date/location in the JSX below.
// ─────────────────────────────────────────────────────────────────────────────
const SHOW_HOLIDAY_CENTRAL = true

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
    note: 'Help power everything we do — no shelter visits required. We’ll set up a meeting with someone from our Kids In Crisis Leadership Team who will help guide you.',
    items: [
      { value: 'Special Events & Advocacy', label: 'Special Events & Advocacy', description: 'Donate your expertise year-round on an event committee, or represent us in the community.' },
      { value: 'Collections & Drives', label: 'Collections & Drives', description: 'Gather essentials or sponsor a holiday wish list.' },
      { value: 'Event Volunteers', label: 'Event Volunteers', description: 'Lend a hand on the day of our events — no ongoing commitment.' },
    ],
  },
  {
    heading: 'Tier 2 — Make a Direct Impact',
    note: 'Brighten our kids’ days with something you put together at home and drop off. Even a simple drop-off makes a real difference — and just being on-site can be inspiring. Someone from our Kids In Crisis Leadership Team will meet with you to find the best fit and arrange drop-offs.',
    items: [
      { value: 'Dinner Donation', label: 'Dinner Donation', description: 'Cook a meal at home and drop it off. Great for groups!' },
      { value: 'Grocery Shopping for Our Shelter', label: 'Grocery Shopping for Our Shelter', description: 'Take our grocery list to the store — nothing beats the smiles when fresh food and snacks arrive.' },
      { value: 'Restock Our Clinic', label: 'Restock Our Clinic', description: 'Every kid at the shelter uses our clinic. Help us keep drugstore essentials stocked.' },
      { value: 'Birthday Basket', label: 'Birthday Basket', description: 'Celebrate the birthdays of every kid staying in the shelter this month.' },
      { value: 'Facility Upkeep', label: 'Facility Upkeep', description: 'Organize, paint, or garden while the kids are at school.' },
    ],
  },
  {
    heading: 'Tier 3 — Lead One of Our External Programs',
    note: 'Lead one of our programs out in the community. Because you will be working with vulnerable populations, these roles require additional background checks and paperwork. Some roles may require additional screening depending on the program.',
    items: [
      { value: 'Lighthouse Facilitator or Coordinator', label: 'Lighthouse Facilitator or Coordinator', description: 'Commit to helping lead weekly teen meetings — the heart of the program.' },
      { value: 'Host a Lighthouse Activity', label: 'Host a Lighthouse Activity', description: 'One-time fun: teach a skill you love, or host the teens at your studio.' },
      { value: 'SafeTalk Volunteer', label: 'SafeTalk Volunteer', description: 'Help teach K–5 kids to recognize unsafe situations.' },
    ],
  },
  {
    heading: 'Tier 4 — Engage with the Kids at the SafeHaven Shelter',
    note: 'This one is so fulfilling! You’ll spend time directly with our kids at the shelter. Because you will be working with vulnerable populations, these roles require additional background checks and paperwork. (Coming with a corporate, church, or school group for a one-time visit? Group events are arranged directly with our team — no individual vetting needed. Just check what interests you and note your group above.)',
    items: [
      { value: 'Cook a Meal with our Kids', label: 'Cook a Meal with our Kids', description: 'Cook dinner at the shelter with our residents.' },
      { value: 'Garden with our Kids', label: 'Garden with our Kids', description: 'Garden side by side with our kids.' },
      { value: 'Share Your Arts with our Kids', label: 'Share Your Arts with our Kids', description: 'Bring your love of art, music, or dance to the kids after school — weekly visits are gold.' },
      { value: 'Help our Kids with Homework', label: 'Help our Kids with Homework', description: 'Homework help for our kids and teens.' },
      { value: 'Outdoor Fun with our Kids', label: 'Outdoor Fun with our Kids', description: 'Host a BBQ or backyard games.' },
      { value: 'Activities with Residents', label: 'Activities with Residents', description: 'Sponsor and join an outing — bowling, pottery, a museum.' },
    ],
  },
] as const

const TIER_REQUIREMENTS = [
  {
    heading: 'Tier 1 — Support Our Mission',
    requirements: [
      'Meet with the Kids In Crisis Leadership Team, who will help guide you',
    ],
  },
  {
    heading: 'Tier 2 — Make a Direct Impact',
    requirements: [
      'Meet with and be approved by the Kids In Crisis Leadership Team',
    ],
  },
  {
    heading: 'Tier 3 — Lead One of Our External Programs',
    requirements: [
      'Meet with and be approved by the Kids In Crisis Leadership Team',
      'Completed application form',
      'References',
      'Conduct standards agreement',
      'Confidentiality agreement',
      'Mandated reporter acknowledgment',
      'Self-attestation of general good health',
      'Training session',
      'Some roles may require additional screening depending on the program',
    ],
  },
  {
    heading: 'Tier 4 — Engage with the Kids at the SafeHaven Shelter',
    requirements: [
      'Everything in Tier 3, except the health requirement is a medical form completed by your doctor instead of a self-attestation',
      'Background checks (DCF CPS + CT criminal history)',
      'One-time group visits: arranged directly with our team — no individual application needed.',
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
                              <span className="font-bold">{item.label}</span>
                              <span className="text-gray-600"> &mdash; {item.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {SHOW_HOLIDAY_CENTRAL && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="font-bold text-gray-800 text-lg mb-1">&#10052; Holiday Central &#10052;</p>
                      <p className="text-sm text-gray-600 mb-4">
                        Every November, Kids In Crisis collects and distributes holiday gifts to children
                        from over 500 families throughout Fairfield County. For these families the holidays
                        can be tough &mdash; and your support truly makes a difference.
                      </p>

                      {/* [VERIFY: current year's wishlist link before enabling] */}
                      <a
                        href="https://www.amazon.com/registries/gl/guest-view/2UBTXI058ACZX"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-block mb-4"
                      >
                        View the Holiday Central Amazon Wishlist
                      </a>

                      <div className="space-y-2">
                        {HOLIDAY_CENTRAL_INTERESTS.map((item) => (
                          <label
                            key={item.value}
                            className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition"
                          >
                            <input
                              type="checkbox"
                              checked={formData.interests.includes(item.value)}
                              onChange={() => toggleInterest(item.value)}
                              className="accent-[#e31837] mt-1"
                            />
                            <span className="text-sm">
                              <span className="font-bold">{item.label}</span>
                              <span className="text-gray-600"> &mdash; {item.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* [VERIFY: date and location before enabling] */}
                      <p className="text-xs text-gray-500 mt-3">
                        All items should be received by Friday, December 5th at North Greenwich
                        Congregational Church, 606 Riversville Rd., Greenwich, CT 06831.
                      </p>
                    </div>
                  )}

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
