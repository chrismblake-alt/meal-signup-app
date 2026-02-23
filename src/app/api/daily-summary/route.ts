import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const VALID_LOCATIONS = ['Brick Building', 'Yellow Farmhouse']

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const summaryRecipient = process.env.DAILY_SUMMARY_EMAIL || 'dinnerdonations@kidsincrisis.org, cblake@kidsincrisis.org'
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim()

    // Calculate date boundaries in EST (UTC-5)
    const now = new Date()
    const estOffset = 5 * 60 * 60 * 1000
    const estNow = new Date(now.getTime() - estOffset)
    const todayStr = estNow.toISOString().split('T')[0]

    const today = new Date(todayStr + 'T00:00:00.000Z')
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
    const dayThree = new Date(dayAfterTomorrow)
    dayThree.setDate(dayThree.getDate() + 1)

    // Fetch kid count from SiteSettings
    const siteSettings = await prisma.siteSettings.findUnique({ where: { id: 'main' } })
    const kidCountMin = siteSettings?.kidCountMin ?? 8
    const kidCountMax = siteSettings?.kidCountMax ?? 12
    const kidCountDisplay = kidCountMin === kidCountMax
      ? `${kidCountMin}`
      : `${kidCountMin}-${kidCountMax}`

    // --- PART 1: Send reminder emails to tomorrow's volunteers ---

    const tomorrowSignups = await prisma.mealSignup.findMany({
      where: {
        date: { gte: tomorrow, lt: dayAfterTomorrow },
        cancelled: false,
      },
      orderBy: [{ location: 'asc' }, { name: 'asc' }],
    })

    const reminderResults = []
    for (const signup of tomorrowSignups) {
      if (signup.reminderSent) continue

      const formattedDate = new Date(signup.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const cancelUrl = `${baseUrl}/cancel/${signup.cancelToken}`

      const emailResult = await sendEmail({
        to: signup.email,
        subject: `Reminder: Your Meal is Tomorrow - ${formattedDate}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #e31837; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .highlight { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
              .btn { display: inline-block; background: #e31837; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; margin-top: 15px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reminder: Your Meal is Tomorrow!</h1>
              </div>
              <div class="content">
                <p>Hi ${signup.name},</p>

                <p>This is a friendly reminder that you're signed up to provide a meal tomorrow for Kids In Crisis.</p>

                <div class="highlight">
                  <p><strong>Date:</strong> ${formattedDate}</p>
                  <p><strong>Location:</strong> ${signup.location}</p>
                  <p><strong>Bringing:</strong> ${signup.bringing}</p>
                </div>

                <div style="background: #fff3cd; border: 2px solid #e31837; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                  <p style="margin: 0; font-size: 16px; color: #333;"><strong>Please prepare meals for approximately</strong></p>
                  <p style="margin: 8px 0; font-size: 32px; font-weight: bold; color: #e31837;">${kidCountDisplay} children</p>
                  <p style="margin: 0; font-size: 14px; color: #666;">at the ${signup.location}</p>
                </div>

                <p><strong>Delivery Time:</strong> 12:00 PM - 5:00 PM</p>
                <p><strong>Address:</strong> 1 Salem Street, Cos Cob, CT 06807</p>

                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>If you wish to drop off early in the day, please include reheating instructions.</li>
                </ul>

                <div style="margin: 20px 0;">
                  <p><strong>Delivery Options</strong></p>
                  <p>For those of you interested in delivery options – here are some local favorites:</p>
                  <ul style="padding-left: 20px;">
                    <li>Chicken Joe's (High School Special NO soda, please) (203) 861-0099</li>
                    <li>Garden Catering (203) 698-2900</li>
                    <li>Arcuri's (Pizza) (203) 869-6999</li>
                    <li>Pomodoro (Italian) (203) 698-7779</li>
                  </ul>
                </div>

                <p>If you can no longer make it, please cancel as soon as possible so we can find a replacement:</p>
                <a href="${cancelUrl}" class="btn">Cancel My Sign-Up</a>
              </div>
              <div class="footer">
                <p>Thank you for supporting Kids In Crisis!<br>
                (203) 661-1911</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      if (emailResult.success) {
        await prisma.mealSignup.update({
          where: { id: signup.id },
          data: { reminderSent: true },
        })
        reminderResults.push({ id: signup.id, email: signup.email, status: 'sent' })
      } else {
        reminderResults.push({ id: signup.id, email: signup.email, status: 'failed' })
      }
    }

    // --- PART 2: Send daily summary email ---

    // Query today's deliveries
    const todaySignups = await prisma.mealSignup.findMany({
      where: {
        date: { gte: today, lt: tomorrow },
        cancelled: false,
      },
      orderBy: [{ location: 'asc' }, { name: 'asc' }],
    })

    // Query day-after-tomorrow's deliveries
    const dayAfterTomorrowSignups = await prisma.mealSignup.findMany({
      where: {
        date: { gte: dayAfterTomorrow, lt: dayThree },
        cancelled: false,
      },
      orderBy: [{ location: 'asc' }, { name: 'asc' }],
    })

    // Query cancellations from past 24 hours
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const recentCancellations = await prisma.mealSignup.findMany({
      where: {
        cancelled: true,
        cancelledAt: { gte: twentyFourHoursAgo },
      },
      orderBy: { cancelledAt: 'desc' },
    })

    // Find open slots in next 7 days
    const weekEnd = new Date(today)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekSignups = await prisma.mealSignup.findMany({
      where: {
        date: { gte: today, lt: weekEnd },
        cancelled: false,
      },
      select: { date: true, location: true },
    })

    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        date: { gte: today, lt: weekEnd },
      },
    })

    const takenSlots = new Set(
      weekSignups.map(s => {
        const dateStr = new Date(s.date).toISOString().split('T')[0]
        return `${dateStr}|${s.location}`
      })
    )

    const blockedSet = new Set(
      blockedDates.map(b => new Date(b.date).toISOString().split('T')[0])
    )

    const openSlots: { date: Date; location: string }[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(today)
      day.setDate(day.getDate() + i)
      const dayStr = day.toISOString().split('T')[0]

      if (blockedSet.has(dayStr)) continue

      for (const location of VALID_LOCATIONS) {
        if (!takenSlots.has(`${dayStr}|${location}`)) {
          openSlots.push({ date: day, location })
        }
      }
    }

    // Format dates for display
    const formatDate = (d: Date) =>
      new Date(d).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })

    const todayFormatted = formatDate(today)

    // Build signup table rows
    const signupRow = (s: { name: string; phone: string; email: string; bringing: string; location: string }) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.phone}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.email}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.bringing}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.location}</td>
      </tr>`

    const signupTable = (signups: typeof todaySignups) => signups.length === 0
      ? '<p style="color: #666; font-style: italic;">No deliveries scheduled.</p>'
      : `<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 8px; text-align: left;">Name</th>
              <th style="padding: 8px; text-align: left;">Phone</th>
              <th style="padding: 8px; text-align: left;">Email</th>
              <th style="padding: 8px; text-align: left;">Bringing</th>
              <th style="padding: 8px; text-align: left;">Location</th>
            </tr>
          </thead>
          <tbody>${signups.map(signupRow).join('')}</tbody>
        </table>`

    const cancellationSection = recentCancellations.length === 0
      ? '<p style="color: #666; font-style: italic;">No recent cancellations.</p>'
      : `<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: #f0f0f0;">
              <th style="padding: 8px; text-align: left;">Name</th>
              <th style="padding: 8px; text-align: left;">Date</th>
              <th style="padding: 8px; text-align: left;">Location</th>
              <th style="padding: 8px; text-align: left;">Was Bringing</th>
            </tr>
          </thead>
          <tbody>${recentCancellations.map(s => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDate(s.date)}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.location}</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">${s.bringing}</td>
            </tr>`).join('')}</tbody>
        </table>`

    const openSlotsSection = openSlots.length === 0
      ? '<p style="color: #28a745; font-style: italic;">All slots are filled for the next 7 days!</p>'
      : `<ul style="padding-left: 20px;">${openSlots.map(s =>
          `<li style="margin-bottom: 4px;"><strong>${formatDate(s.date)}</strong> - ${s.location}</li>`
        ).join('')}</ul>`

    const summaryHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #e31837; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; color: #e31837; border-bottom: 2px solid #e31837; padding-bottom: 5px; margin-bottom: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Daily Meal Summary</h1>
            <p style="margin: 5px 0 0 0; font-size: 16px;">${todayFormatted}</p>
          </div>
          <div class="content">
            <div class="section">
              <h2 class="section-title">Today's Deliveries</h2>
              ${signupTable(todaySignups)}
            </div>

            <div class="section">
              <h2 class="section-title">Tomorrow's Deliveries</h2>
              ${signupTable(tomorrowSignups)}
            </div>

            <div class="section">
              <h2 class="section-title">${formatDate(dayAfterTomorrow)}'s Deliveries</h2>
              ${signupTable(dayAfterTomorrowSignups)}
            </div>

            <div class="section">
              <h2 class="section-title">Cancellations (Past 24 Hours)</h2>
              ${cancellationSection}
            </div>

            <div class="section">
              <h2 class="section-title">Open Slots - Next 7 Days</h2>
              ${openSlotsSection}
            </div>
          </div>
          <div class="footer">
            <p>Kids In Crisis<br>
            1 Salem Street, Cos Cob, CT 06807<br>
            (203) 661-1911</p>
          </div>
        </div>
      </body>
      </html>
    `

    const summaryResult = await sendEmail({
      to: summaryRecipient,
      subject: `Daily Meal Summary - ${todayFormatted}`,
      html: summaryHtml,
    })

    return NextResponse.json({
      success: true,
      summaryEmailSent: summaryResult.success,
      remindersSent: reminderResults.filter(r => r.status === 'sent').length,
      remindersFailed: reminderResults.filter(r => r.status === 'failed').length,
      todayCount: todaySignups.length,
      tomorrowCount: tomorrowSignups.length,
      dayAfterTomorrowCount: dayAfterTomorrowSignups.length,
      cancellationsCount: recentCancellations.length,
      openSlotsCount: openSlots.length,
    })
  } catch (error) {
    console.error('Error running daily summary:', error)
    return NextResponse.json({ error: 'Failed to run daily summary' }, { status: 500 })
  }
}
