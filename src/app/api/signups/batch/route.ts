import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendBatchConfirmationEmail } from '@/lib/email'

const MAX_DATES = 30
const LOCATIONS = ['Brick Building', 'Yellow Farmhouse']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, bringing, notes, dates } = body

    if (!name || !email || !phone || !bringing) {
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

    // Batch check existing signups for all requested dates (with locations)
    const existingSignups = await prisma.mealSignup.findMany({
      where: {
        OR: dateRanges.map(({ start, end }) => ({
          date: { gte: start, lt: end },
        })),
        cancelled: false,
      },
      select: { date: true, location: true },
    })

    // Build a map of date -> taken locations
    const takenLocationsMap: Record<string, string[]> = {}
    existingSignups.forEach((s) => {
      const dateStr = s.date.toISOString().split('T')[0]
      if (!takenLocationsMap[dateStr]) takenLocationsMap[dateStr] = []
      if (!takenLocationsMap[dateStr].includes(s.location)) {
        takenLocationsMap[dateStr].push(s.location)
      }
    })

    // Auto-assign locations and check availability
    const dateLocationPairs: Array<{ date: Date; location: string }> = []
    const fullyBookedDates: string[] = []

    for (const date of parsedDates) {
      const dateStr = date.toISOString().split('T')[0]
      const taken = takenLocationsMap[dateStr] || []
      const available = LOCATIONS.find((l) => !taken.includes(l))
      if (!available) {
        fullyBookedDates.push(
          date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        )
      } else {
        dateLocationPairs.push({ date, location: available })
      }
    }

    if (fullyBookedDates.length > 0) {
      return NextResponse.json(
        { error: `Both locations are taken for: ${fullyBookedDates.join(', ')}` },
        { status: 400 }
      )
    }

    // Create all signups in a transaction
    const signups = await prisma.$transaction(
      dateLocationPairs.map(({ date, location }) =>
        prisma.mealSignup.create({
          data: {
            name,
            email,
            phone,
            bringing,
            notes: notes || null,
            date,
            location,
          },
        })
      )
    )

    // Fetch kid count from SiteSettings
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
    const kidCountMin = siteSettings?.kidCountMin ?? 8
    const kidCountMax = siteSettings?.kidCountMax ?? 12
    const kidCountDisplay = kidCountMin === kidCountMax
      ? `${kidCountMin}`
      : `${kidCountMin}-${kidCountMax}`

    // Send one batch confirmation email
    await sendBatchConfirmationEmail({
      name,
      email,
      bringing,
      kidCountDisplay,
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
