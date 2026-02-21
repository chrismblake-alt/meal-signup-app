import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendBatchConfirmationEmail } from '@/lib/email'

const VALID_LOCATIONS = ['Brick Building', 'Yellow Farmhouse']
const MAX_DATES = 30

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, bringing, mealValue, notes, dates } = body

    if (!name || !email || !phone || !bringing || !mealValue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: 'Please select at least one date' }, { status: 400 })
    }

    if (dates.length > MAX_DATES) {
      return NextResponse.json({ error: `Maximum ${MAX_DATES} dates per sign-up` }, { status: 400 })
    }

    // Parse and deduplicate dates
    const parsedDates: Date[] = []
    const seenDateStrs = new Set<string>()
    for (const d of dates) {
      const parsed = new Date(d)
      parsed.setHours(12, 0, 0, 0)
      const dateStr = parsed.toISOString().split('T')[0]
      if (!seenDateStrs.has(dateStr)) {
        seenDateStrs.add(dateStr)
        parsedDates.push(parsed)
      }
    }

    // Build date ranges for batch queries
    const dateRanges = parsedDates.map((d) => {
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)
      return { start, end, date: d }
    })

    // Batch check blocked dates
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        OR: dateRanges.map(({ start, end }) => ({
          date: { gte: start, lt: end },
        })),
      },
    })

    if (blockedDates.length > 0) {
      const blockedStrs = blockedDates.map((b) =>
        b.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      )
      return NextResponse.json(
        { error: `The following dates are not available: ${blockedStrs.join(', ')}` },
        { status: 400 }
      )
    }

    // Batch check existing signups for all requested dates
    const existingSignups = await prisma.mealSignup.findMany({
      where: {
        OR: dateRanges.map(({ start, end }) => ({
          date: { gte: start, lt: end },
        })),
        cancelled: false,
      },
      select: { date: true, location: true },
    })

    // Build a map of taken locations per date
    const takenLocations: Record<string, string[]> = {}
    for (const s of existingSignups) {
      const dateStr = s.date.toISOString().split('T')[0]
      if (!takenLocations[dateStr]) takenLocations[dateStr] = []
      if (!takenLocations[dateStr].includes(s.location)) {
        takenLocations[dateStr].push(s.location)
      }
    }

    // Auto-assign locations and check availability
    const assignments: Array<{ date: Date; location: string }> = []
    const fullyBookedDates: string[] = []

    for (const date of parsedDates) {
      const dateStr = date.toISOString().split('T')[0]
      const taken = takenLocations[dateStr] || []
      const available = VALID_LOCATIONS.find((l) => !taken.includes(l))
      if (!available) {
        fullyBookedDates.push(
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
      } else {
        assignments.push({ date, location: available })
      }
    }

    if (fullyBookedDates.length > 0) {
      return NextResponse.json(
        { error: `The following dates are fully booked: ${fullyBookedDates.join(', ')}` },
        { status: 400 }
      )
    }

    // Create all signups in a transaction
    const signups = await prisma.$transaction(
      assignments.map(({ date, location }) =>
        prisma.mealSignup.create({
          data: {
            name,
            email,
            phone,
            bringing,
            mealValue: parseFloat(mealValue),
            notes: notes || null,
            date,
            location,
          },
        })
      )
    )

    // Send one batch confirmation email
    await sendBatchConfirmationEmail({
      name,
      email,
      bringing,
      mealValue: parseFloat(mealValue),
      signups: signups.map((s) => ({
        date: s.date,
        location: s.location,
        cancelToken: s.cancelToken,
      })),
    })

    return NextResponse.json({ success: true, signups })
  } catch (error) {
    console.error('Error creating batch signups:', error)
    return NextResponse.json({ error: 'Failed to create sign-ups' }, { status: 500 })
  }
}
