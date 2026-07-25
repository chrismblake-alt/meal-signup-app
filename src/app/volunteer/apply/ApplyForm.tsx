'use client'

import { useState } from 'react'

const ROLES = [
  'Cook a Meal with our Kids',
  'Garden with our Kids',
  'Help our Kids with Homework',
  'Outdoor Fun with our Kids',
  'Activities with Residents',
  'Lighthouse Facilitator or Coordinator (Tier 4)',
  'SafeTalk Volunteer (Tier 4)',
] as const

const TIER4_ROLES: readonly string[] = [
  'Lighthouse Facilitator or Coordinator (Tier 4)',
  'SafeTalk Volunteer (Tier 4)',
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
  roles: string[]
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
  roles: [],
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
  const [submitted, setSubmitted] = useState<null | { tier4: boolean }>(null)

  const tier4 = form.roles.some((r) => TIER4_ROLES.includes(r))

  const todayStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const toggleRole = (role: string) =>
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }))

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

    if (form.roles.length === 0) return 'Please select at least one volunteer role.'

    if (!form.agreeConduct) return 'Please agree to the Volunteer Conduct Standards (Section 5).'
    if (!form.agreeConfidentiality) return 'Please acknowledge the Confidentiality statute (Section 6).'
    if (!form.agreeResidentGuidelines) return 'Please acknowledge the Guidelines for Interacting with Residents (Section 7).'
    if (tier4 && !form.agreeMandatedReporter) return 'Please acknowledge the Mandated Reporter expectations (Section 8).'
    if (tier4 && !form.attestHealth) return 'Please complete the health self-attestation (Section 9).'

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
      setSubmitted({ tier4: Boolean(data.tier4) })
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
            {submitted.tier4 ? (
              <>
                <h2 className="text-2xl font-semibold text-green-800 mb-4 text-center">
                  Application received — two more steps
                </h2>
                <p className="text-green-800 mb-4">
                  Thank you! Jennifer will be in touch soon. Because your role involves working
                  directly with our kids, Connecticut requires two background checks:
                </p>
                <ol className="list-decimal pl-6 space-y-3 text-green-800">
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
            <SectionHeading number={2} title="Your Roles" />
            <p className="text-gray-600 mb-3">Which volunteer roles are you pursuing? Check all that apply:</p>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <label key={role} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                  <input type="checkbox" className="accent-[#e31837] mt-1" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />
                  <span className="text-sm font-medium">{role}</span>
                </label>
              ))}
            </div>
            {tier4 && (
              <p className="mt-3 text-sm text-gray-500 italic">
                Because you selected a Tier 4 role, Sections 8 and 9 below are now required.
              </p>
            )}
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

          {/* SECTION 8 — Tier 4 only */}
          {tier4 && (
            <p className="text-sm text-gray-500 italic">
              Because you selected a Tier 4 role, two additional sections are required below.
            </p>
          )}

          {/* SECTION 8 — Tier 4 only */}
          {tier4 && (
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
          )}

          {/* SECTION 9 — Tier 4 only */}
          {tier4 && (
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
