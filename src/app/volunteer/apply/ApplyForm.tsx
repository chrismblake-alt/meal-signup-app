'use client'

import { useState } from 'react'

const TIERS = [
  {
    value: 'Tier 3',
    title: 'Tier 3 — Lead One of Our External Programs',
    roles: 'Lighthouse Facilitator or Coordinator · Host a Lighthouse Activity · SafeTalk Volunteer',
  },
  {
    value: 'Tier 4',
    title: 'Tier 4 — Engage with the Kids at the SafeHaven Shelter',
    roles: 'Help our Kids with Homework · Share Your Arts with our Kids · Garden with our Kids · Cook a Meal with our Kids · Outdoor Fun with our Kids · Activities with Residents',
  },
] as const

const CONDUCT_BULLETS = [
  'Your relationship with the kids exists only within Kids In Crisis programs — no contact outside, and no staying in touch after, even when a child asks. Kids here may form attachments quickly, and these boundaries protect them from another loss.',
  'Never share your phone number, address, or social media with residents — and no visits to your home, ever.',
  'No gifts to a child (even small treats) without their Social Worker’s OK, and no accepting gifts from kids or their families.',
  'If you’re ever unsure what’s appropriate, ask a staff member — that’s always the right move.',
]

const CONFIDENTIALITY_BULLETS = [
  'Everything about our residents is confidential: their names, faces, stories, why they’re here, even the fact that they’re here at all.',
  'This applies during your time with us and forever after.',
  'You may not share information about our kids with anyone — not family, not friends, not social media.',
  'Breaking this confidentiality isn’t just against our policy — it’s against state law, punishable by a fine of up to $1,000, up to a year of imprisonment, or both.',
  'The statute below is the full law. The summary above is to help you understand it, but you are agreeing to the statute itself.',
]

interface ApplyFormProps {
  conductStandards: string
  confidentialityStatute: string
  residentGuidelines: string
  mandatedReporter: string
}

interface FormState {
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
  priorExperience: string
  specialTraining: string
  communityService: string
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
  // Honeypot — must stay empty for real submissions.
  website: string
}

const INITIAL_STATE: FormState = {
  fullName: '',
  streetAddress: '',
  townCity: '',
  state: 'CT',
  zip: '',
  email: '',
  phone: '',
  emergencyName: '',
  emergencyRelationship: '',
  emergencyPhone: '',
  tier: '',
  priorExperience: '',
  specialTraining: '',
  communityService: '',
  reference1Name: '',
  reference1Phone: '',
  reference1Email: '',
  reference2Name: '',
  reference2Phone: '',
  reference2Email: '',
  agreeConduct: false,
  agreeConfidentiality: false,
  agreeResidentGuidelines: false,
  agreeMandatedReporter: false,
  attestHealth: false,
  signature: '',
  website: '',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LegalBox({ text }: { text: string }) {
  return (
    <div className="max-h-[300px] overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-50 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
      {text}
    </div>
  )
}

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <h2 className="text-xl font-semibold text-gray-800 mb-4">
      <span className="text-[#e31837]">Section {number}.</span> {title}
    </h2>
  )
}

export default function ApplyForm({
  conductStandards,
  confidentialityStatute,
  residentGuidelines,
  mandatedReporter,
}: ApplyFormProps) {
  const [form, setForm] = useState<FormState>(INITIAL_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState<null | { tier: string }>(null)

  const isTier3 = form.tier === 'Tier 3'
  const isTier4 = form.tier === 'Tier 4'

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = (): string | null => {
    const required: Array<[keyof FormState, string]> = [
      ['fullName', 'your full name'],
      ['streetAddress', 'your street address'],
      ['townCity', 'your town/city'],
      ['state', 'your state'],
      ['zip', 'your zip code'],
      ['email', 'your email'],
      ['phone', 'your phone number'],
      ['emergencyName', 'your emergency contact name'],
      ['emergencyRelationship', 'your emergency contact relationship'],
      ['emergencyPhone', 'your emergency contact phone'],
      ['reference1Name', 'reference 1 name'],
      ['reference1Phone', 'reference 1 phone'],
      ['reference1Email', 'reference 1 email'],
      ['reference2Name', 'reference 2 name'],
      ['reference2Phone', 'reference 2 phone'],
      ['reference2Email', 'reference 2 email'],
      ['signature', 'your typed signature'],
    ]
    for (const [key, label] of required) {
      if (!String(form[key]).trim()) return `Please provide ${label}.`
    }

    if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid email address.'
    if (!EMAIL_RE.test(form.reference1Email.trim())) return 'Please enter a valid email for reference 1.'
    if (!EMAIL_RE.test(form.reference2Email.trim())) return 'Please enter a valid email for reference 2.'

    if (form.tier !== 'Tier 3' && form.tier !== 'Tier 4') return 'Please select which level you are applying for (Section 2).'

    if (!form.agreeConduct) return 'Please agree to the Volunteer Conduct Standards (Section 5).'
    if (!form.agreeConfidentiality) return 'Please acknowledge the Confidentiality statute (Section 6).'
    if (!form.agreeResidentGuidelines) return 'Please acknowledge the Guidelines for Interacting with Residents (Section 7).'
    if (!form.agreeMandatedReporter) return 'Please acknowledge the Mandated Reporter expectations (Section 8).'
    if (isTier3 && !form.attestHealth) return 'Please complete the health self-attestation (Section 9).'

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/volunteer/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      setSubmitted({ tier: typeof data.tier === 'string' ? data.tier : form.tier })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 md:p-8">
            <div className="text-green-600 text-5xl mb-4 text-center">&#10003;</div>
            {submitted.tier === 'Tier 4' ? (
              <>
                <h2 className="text-2xl font-semibold text-green-800 mb-4 text-center">
                  Application received — a few more steps
                </h2>
                <p className="text-green-800 mb-4">
                  Thank you! Jennifer will be in touch soon. Because you&rsquo;ll be spending time
                  directly with our kids at the shelter, Connecticut requires a medical form and two
                  background checks:
                </p>
                <ol className="list-decimal pl-6 space-y-3 text-green-800">
                  <li>
                    <span className="font-semibold">Doctor&rsquo;s Medical Form</span> — We&rsquo;ll send
                    you a short medical form for your doctor to complete and sign.
                  </li>
                  <li>
                    <span className="font-semibold">DCF Background Check</span> — We&rsquo;ll send you
                    the DCF authorization form (DCF-3031) to complete.
                  </li>
                  <li>
                    <span className="font-semibold">State Criminal History Check</span> — You&rsquo;ll
                    mail this form directly to the State of Connecticut with a $36 fee. We&rsquo;ll
                    send you the form and instructions. If the fee is a hardship, just let Jennifer
                    know — we can discuss it.
                  </li>
                </ol>
                <p className="text-green-800 mt-4 font-medium">Nothing else is needed from you today.</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-green-800 mb-4 text-center">
                  Application received!
                </h2>
                <p className="text-green-800 text-center">
                  Thank you. Jennifer will be in touch soon to schedule your meeting and training
                  session. Nothing else is needed from you today.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Volunteer Application</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Welcome! We&rsquo;re excited to move forward with you. Please complete this application and
            review our standards below. Questions? Contact Jennifer Febles at{' '}
            <a href="mailto:jfebles@kidsincrisis.org" className="text-[#e31837] underline">
              jfebles@kidsincrisis.org
            </a>{' '}
            or{' '}
            <a href="tel:2036226556" className="text-[#e31837] underline">
              203-622-6556
            </a>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot — hidden from users, tempting to bots. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
            />
          </div>

          {/* SECTION 1 */}
          <div className="card">
            <SectionHeading number={1} title="About You" />
            <div className="space-y-4">
              <div>
                <label htmlFor="fullName" className="form-label">Full Name *</label>
                <input id="fullName" type="text" required className="form-input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
              </div>
              <div>
                <label htmlFor="streetAddress" className="form-label">Street Address *</label>
                <input id="streetAddress" type="text" required className="form-input" value={form.streetAddress} onChange={(e) => set('streetAddress', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="townCity" className="form-label">Town / City *</label>
                  <input id="townCity" type="text" required className="form-input" value={form.townCity} onChange={(e) => set('townCity', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="state" className="form-label">State *</label>
                  <input id="state" type="text" required className="form-input" value={form.state} onChange={(e) => set('state', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="zip" className="form-label">Zip *</label>
                  <input id="zip" type="text" required className="form-input" value={form.zip} onChange={(e) => set('zip', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input id="email" type="email" required className="form-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">Phone *</label>
                  <input id="phone" type="tel" required className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
              </div>

              <div>
                <p className="form-label">Emergency Contact *</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input type="text" required className="form-input" placeholder="Name" aria-label="Emergency contact name" value={form.emergencyName} onChange={(e) => set('emergencyName', e.target.value)} />
                  <input type="text" required className="form-input" placeholder="Relationship" aria-label="Emergency contact relationship" value={form.emergencyRelationship} onChange={(e) => set('emergencyRelationship', e.target.value)} />
                  <input type="tel" required className="form-input" placeholder="Phone" aria-label="Emergency contact phone" value={form.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2 */}
          <div className="card">
            <SectionHeading number={2} title="Which Level Are You Applying For?" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIERS.map((t) => {
                const selected = form.tier === t.value
                return (
                  <label
                    key={t.value}
                    className={`block p-5 rounded-xl border-2 cursor-pointer transition ${
                      selected ? 'border-[#e31837] bg-[#e31837]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tier"
                      value={t.value}
                      checked={selected}
                      onChange={() => set('tier', t.value)}
                      className="sr-only"
                    />
                    <span className="flex items-start gap-3">
                      <span
                        className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                          selected ? 'border-[#e31837]' : 'border-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-[#e31837]" />}
                      </span>
                      <span>
                        <span className="block font-bold text-gray-800">{t.title}</span>
                        <span className="mt-1 block text-sm text-gray-500">{t.roles}</span>
                      </span>
                    </span>
                  </label>
                )
              })}
            </div>

            {isTier4 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <p className="font-semibold text-amber-900 mb-2">A note about what comes next</p>
                <p className="text-sm text-amber-900 mb-2">
                  The children at our shelter have often been through a lot, and keeping them safe is at
                  the heart of everything we do. Because Tier 4 volunteers spend time directly with our
                  kids, Connecticut requires — and we wholeheartedly agree — a few extra steps:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-amber-900">
                  <li>
                    Medical clearance from your doctor (instead of the self-attestation) — we’ll send you
                    the simple form
                  </li>
                  <li>Two background checks, which our team will guide you through step by step</li>
                </ul>
                <p className="text-sm text-amber-900 mt-2">
                  There’s nothing to do about these today — finish this application, and we’ll walk you
                  through each step. Thank you for understanding; it’s all for the kids.
                </p>
              </div>
            )}

            <p className="mt-3 text-sm text-gray-500 italic">
              Applying for roles in both tiers? Choose Tier 4 — it covers everything.
            </p>
          </div>

          {/* SECTION 3 */}
          <div className="card">
            <SectionHeading number={3} title="Your Experience" />
            <div className="space-y-4">
              <div>
                <label htmlFor="priorExperience" className="form-label">What prior volunteer experience do you have?</label>
                <textarea id="priorExperience" rows={3} className="form-input" value={form.priorExperience} onChange={(e) => set('priorExperience', e.target.value)} />
              </div>
              <div>
                <label htmlFor="specialTraining" className="form-label">
                  Do you have any special training or hobby you&rsquo;d like to share with our children? (arts/crafts, foreign language, photography, etc.)
                </label>
                <textarea id="specialTraining" rows={3} className="form-input" value={form.specialTraining} onChange={(e) => set('specialTraining', e.target.value)} />
              </div>
              <div>
                <label htmlFor="communityService" className="form-label">
                  Are you volunteering to fulfill a community service requirement? If yes, please note the program and hours needed.
                </label>
                <textarea id="communityService" rows={3} className="form-input" value={form.communityService} onChange={(e) => set('communityService', e.target.value)} />
              </div>
            </div>
          </div>

          {/* SECTION 4 */}
          <div className="card">
            <SectionHeading number={4} title="References" />
            <p className="text-gray-600 mb-4">Please list two references (not relatives):</p>
            <div className="space-y-6">
              {([1, 2] as const).map((n) => (
                <div key={n}>
                  <p className="font-semibold text-gray-700 mb-2">Reference {n}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="text" required className="form-input" placeholder="Name" aria-label={`Reference ${n} name`}
                      value={form[`reference${n}Name` as keyof FormState] as string}
                      onChange={(e) => set(`reference${n}Name` as keyof FormState, e.target.value)} />
                    <input type="tel" required className="form-input" placeholder="Phone" aria-label={`Reference ${n} phone`}
                      value={form[`reference${n}Phone` as keyof FormState] as string}
                      onChange={(e) => set(`reference${n}Phone` as keyof FormState, e.target.value)} />
                    <input type="email" required className="form-input" placeholder="Email" aria-label={`Reference ${n} email`}
                      value={form[`reference${n}Email` as keyof FormState] as string}
                      onChange={(e) => set(`reference${n}Email` as keyof FormState, e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5 */}
          <div className="card">
            <SectionHeading number={5} title="Volunteer Conduct Standards" />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-amber-900 mb-2">What you&rsquo;re agreeing to, in plain English</p>
              <p className="text-sm text-amber-900 mb-2">
                The full standards are below, but here&rsquo;s the heart of it: your relationship with our
                kids is a professional one, like a teacher&rsquo;s — warm, caring, and inside clear
                boundaries. The boundaries that surprise people most:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-amber-900">
                {CONDUCT_BULLETS.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
              <p className="text-sm text-amber-900 mt-2">
                The full standards below are what you&rsquo;re agreeing to.
              </p>
            </div>
            <LegalBox text={conductStandards} />
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input type="checkbox" className="accent-[#e31837] mt-1" checked={form.agreeConduct} onChange={(e) => set('agreeConduct', e.target.checked)} />
              <span className="text-sm text-gray-700">
                I have read, understand and agree to abide by the Volunteer Conduct Standards as stated. *
              </span>
            </label>
          </div>

          {/* SECTION 6 */}
          <div className="card">
            <SectionHeading number={6} title="Confidentiality" />
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-amber-900 mb-2">What you&rsquo;re agreeing to, in plain English</p>
              <p className="text-sm text-amber-900 mb-2">
                Connecticut law (General Statutes Sec. 17a-28) protects the records and identities of
                children who receive services from the Department of Children and Families — including
                the kids in our care. As a volunteer, here&rsquo;s what this means for you:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-amber-900">
                {CONFIDENTIALITY_BULLETS.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
            <LegalBox text={confidentialityStatute} />
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input type="checkbox" className="accent-[#e31837] mt-1" checked={form.agreeConfidentiality} onChange={(e) => set('agreeConfidentiality', e.target.checked)} />
              <span className="text-sm text-gray-700">
                I have read the above Connecticut General Statute and understand that as a volunteer of
                Kids in Crisis, Inc. I am mandated to abide by this statute regarding confidentiality. *
              </span>
            </label>
          </div>

          {/* SECTION 7 */}
          <div className="card">
            <SectionHeading number={7} title="Guidelines for Interacting with Residents" />
            <LegalBox text={residentGuidelines} />
            <label className="flex items-start gap-3 mt-4 cursor-pointer">
              <input type="checkbox" className="accent-[#e31837] mt-1" checked={form.agreeResidentGuidelines} onChange={(e) => set('agreeResidentGuidelines', e.target.checked)} />
              <span className="text-sm text-gray-700">
                I have read and understand the expectations of Kids in Crisis and the importance of
                confidentiality. *
              </span>
            </label>
          </div>

          {/* SECTION 8 — required for everyone */}
          <div className="card">
              <SectionHeading number={8} title="Mandated Reporter" />
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-amber-900 mb-2">In plain English</p>
                <p className="text-sm text-amber-900">
                  Because your role involves regular contact with our kids, Connecticut law makes you a
                  mandated reporter. That means if you ever have reasonable cause to suspect a child has
                  been abused or neglected, you are legally required to make sure it gets reported. At
                  Kids In Crisis, that means: bring it to a staff member right away — they will help
                  evaluate and file the report with you. Reports must be made quickly (within 12 hours),
                  and good-faith reporters are protected by law.
                </p>
              </div>
              <LegalBox text={mandatedReporter} />
              <label className="flex items-start gap-3 mt-4 cursor-pointer">
                <input type="checkbox" className="accent-[#e31837] mt-1" checked={form.agreeMandatedReporter} onChange={(e) => set('agreeMandatedReporter', e.target.checked)} />
                <span className="text-sm text-gray-700">
                  I have read and understand the expectations of a Mandated Reporter as it relates to my
                  volunteering at Kids In Crisis. *
                </span>
              </label>
          </div>

          {/* SECTION 9 — required for Tier 3 only */}
          {isTier3 && (
            <div className="card">
              <SectionHeading number={9} title="Health Self-Attestation" />
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="accent-[#e31837] mt-1" checked={form.attestHealth} onChange={(e) => set('attestHealth', e.target.checked)} />
                <span className="text-sm text-gray-700">
                  I attest that I am in general good health and know of no condition that would interfere
                  with my ability to safely perform my volunteer role. *
                </span>
              </label>
            </div>
          )}

          {/* SECTION 10 */}
          <div className="card">
            <SectionHeading number={10} title="Signature" />
            <div className="space-y-4">
              <div>
                <label htmlFor="signature" className="form-label">Type your full legal name as your signature *</label>
                <input id="signature" type="text" required className="form-input" value={form.signature} onChange={(e) => set('signature', e.target.value)} />
              </div>
              <div>
                <p className="form-label">Date</p>
                <p className="text-gray-700">{todayStr}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">{error}</div>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}
