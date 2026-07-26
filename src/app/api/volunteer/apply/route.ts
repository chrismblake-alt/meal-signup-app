import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getSession } from '@/lib/auth'

const NOTIFICATION_RECIPIENTS = [
  'jfebles@kidsincrisis.org',
  'kphillips@kidsincrisis.org',
]

const VALID_TIERS = ['Tier 3', 'Tier 4']

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Basic in-memory throttle: reject rapid repeat submissions from the same source.
// Serverless instances are ephemeral, so this is a lightweight first line of defense.
const SUBMIT_WINDOW_MS = 15_000
const recentSubmissions = new Map<string, number>()

function clientKey(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// GET: admin-only list of submitted applications (for the dashboard).
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const applications = await prisma.volunteerApplication.findMany({
      orderBy: { submittedAt: 'desc' },
    })
    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching volunteer applications:', error)
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    // Honeypot: real users never fill this hidden field.
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    // Rate limit rapid repeat submissions from the same source.
    const key = clientKey(request)
    const now = Date.now()
    const last = recentSubmissions.get(key)
    if (last && now - last < SUBMIT_WINDOW_MS) {
      return NextResponse.json(
        { error: 'You just submitted an application. Please wait a moment before trying again.' },
        { status: 429 }
      )
    }

    // ---- Field extraction + length-limited sanitization ----
    const clean = (value: unknown, max: number): string =>
      typeof value === 'string' ? value.trim().slice(0, max) : ''

    const fullName = clean(body.fullName, 200)
    const streetAddress = clean(body.streetAddress, 300)
    const townCity = clean(body.townCity, 150)
    const state = clean(body.state, 50) || 'CT'
    const zip = clean(body.zip, 20)
    const email = clean(body.email, 200)
    const phone = clean(body.phone, 50)
    const emergencyName = clean(body.emergencyName, 200)
    const emergencyRelationship = clean(body.emergencyRelationship, 150)
    const emergencyPhone = clean(body.emergencyPhone, 50)
    const priorExperience = clean(body.priorExperience, 5000)
    const specialTraining = clean(body.specialTraining, 5000)
    const communityService = clean(body.communityService, 5000)
    const reference1Name = clean(body.reference1Name, 200)
    const reference1Phone = clean(body.reference1Phone, 50)
    const reference1Email = clean(body.reference1Email, 200)
    const reference2Name = clean(body.reference2Name, 200)
    const reference2Phone = clean(body.reference2Phone, 50)
    const reference2Email = clean(body.reference2Email, 200)
    const signature = clean(body.signature, 200)

    const tier = typeof body.tier === 'string' && VALID_TIERS.includes(body.tier) ? body.tier : ''
    const tier4Applied = tier === 'Tier 4'
    const isTier3 = tier === 'Tier 3'

    const agreeConduct = body.agreeConduct === true
    const agreeConfidentiality = body.agreeConfidentiality === true
    const agreeResidentGuidelines = body.agreeResidentGuidelines === true
    const agreeMandatedReporter = body.agreeMandatedReporter === true
    const attestHealth = body.attestHealth === true

    // ---- Validation ----
    const requiredFields: Array<[string, string]> = [
      [fullName, 'full name'],
      [streetAddress, 'street address'],
      [townCity, 'town/city'],
      [state, 'state'],
      [zip, 'zip'],
      [email, 'email'],
      [phone, 'phone'],
      [emergencyName, 'emergency contact name'],
      [emergencyRelationship, 'emergency contact relationship'],
      [emergencyPhone, 'emergency contact phone'],
      [reference1Name, 'reference 1 name'],
      [reference1Phone, 'reference 1 phone'],
      [reference1Email, 'reference 1 email'],
      [reference2Name, 'reference 2 name'],
      [reference2Phone, 'reference 2 phone'],
      [reference2Email, 'reference 2 email'],
      [signature, 'signature'],
    ]
    for (const [value, label] of requiredFields) {
      if (!value) {
        return NextResponse.json({ error: `Missing required field: ${label}` }, { status: 400 })
      }
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!EMAIL_RE.test(reference1Email) || !EMAIL_RE.test(reference2Email)) {
      return NextResponse.json({ error: 'Invalid reference email address' }, { status: 400 })
    }
    if (!tier) {
      return NextResponse.json({ error: 'Please select which level you are applying for' }, { status: 400 })
    }

    // Required acknowledgments: conduct, confidentiality, resident guidelines, and
    // mandated reporter are required for everyone (both tiers).
    if (!agreeConduct || !agreeConfidentiality || !agreeResidentGuidelines || !agreeMandatedReporter) {
      return NextResponse.json({ error: 'Required acknowledgments are missing' }, { status: 400 })
    }
    // Health self-attestation is required only for Tier 3 (Tier 4 uses a doctor's medical form instead).
    if (isTier3 && !attestHealth) {
      return NextResponse.json({ error: 'The health self-attestation is required' }, { status: 400 })
    }

    // Mark this source as having just submitted (only once past validation).
    recentSubmissions.set(key, now)

    const application = await prisma.volunteerApplication.create({
      data: {
        fullName,
        streetAddress,
        townCity,
        state,
        zip,
        email,
        phone,
        emergencyName,
        emergencyRelationship,
        emergencyPhone,
        tier,
        // roles column retained but unused now that a single tier is selected.
        roles: [],
        tier4Applied,
        priorExperience: priorExperience || null,
        specialTraining: specialTraining || null,
        communityService: communityService || null,
        reference1Name,
        reference1Phone,
        reference1Email,
        reference2Name,
        reference2Phone,
        reference2Email,
        agreeConduct,
        agreeConfidentiality,
        agreeResidentGuidelines,
        // Mandated reporter is acknowledged by everyone; health attestation is Tier 3 only.
        agreeMandatedReporter,
        attestHealth: isTier3 ? attestHealth : false,
        signature,
      },
    })

    // Minimal notification email — no applicant details beyond name and tier.
    const html = `
      <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Applying for:</strong> ${escapeHtml(tier)}</p>
      <p>View the full application in the admin dashboard.</p>
    `

    const emailResult = await sendEmail({
      to: NOTIFICATION_RECIPIENTS.join(', '),
      subject: `New Volunteer Application: ${fullName}`,
      html,
    })
    if (!emailResult.success) {
      // Email failure must not block the submission or the confirmation screen.
      console.error('Volunteer application email failed to send; submission was still saved.', emailResult.error)
    }

    return NextResponse.json({ success: true, tier: application.tier })
  } catch (error) {
    console.error('Error creating volunteer application:', error)
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 })
  }
}
