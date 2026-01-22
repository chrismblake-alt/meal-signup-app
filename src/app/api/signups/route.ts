import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function GET() {
  try {
    const signups = await prisma.mealSignup.findMany({
      where: { cancelled: false },
      orderBy: { date: 'asc' },
    })

    return NextResponse.json(signups)
  } catch (error) {
    console.error('Error fetching signups:', error)
    return NextResponse.json({ error: 'Failed to fetch signups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, bringing, notes, date } = body

    if (!name || !email || !phone || !bringing || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const parsedDate = new Date(date)
    parsedDate.setHours(12, 0, 0, 0)

    // Check if date is blocked
    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        date: {
          gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
          lt: new Date(parsedDate.setHours(23, 59, 59, 999)),
        },
      },
    })

    if (blockedDate) {
      return NextResponse.json({ error: 'This date is not available' }, { status: 400 })
    }

    const signup = await prisma.mealSignup.create({
      data: {
        name,
        email,
        phone,
        bringing,
        notes: notes || null,
        date: new Date(date),
      },
    })

    // Fetch current kid count settings
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })
    const kidCountMin = settings?.kidCountMin ?? 8
    const kidCountMax = settings?.kidCountMax ?? 12

    // Send confirmation email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const cancelUrl = `${baseUrl}/cancel/${signup.cancelToken}`
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    await sendEmail({
      to: email,
      subject: `Meal Sign-Up Confirmed - ${formattedDate}`,
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
              <h1>Thank You, ${name}!</h1>
            </div>
            <div class="content">
              <p>Your meal sign-up has been confirmed for Kids In Crisis.</p>

              <div class="highlight">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Bringing:</strong> ${bringing}</p>
              </div>

              <div style="background: #fff3cd; border: 2px solid #e31837; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #333;"><strong>Please prepare meals for approximately</strong></p>
                <p style="margin: 8px 0; font-size: 32px; font-weight: bold; color: #e31837;">${kidCountMin}-${kidCountMax} children</p>
                <p style="margin: 0; font-size: 14px; color: #666;">This count is current as of your sign-up date</p>
              </div>

              <p>The kids and staff are looking forward to your meal! Please plan to deliver between 5:00 PM and 6:00 PM.</p>

              <p>Need to cancel? Click the button below:</p>
              <a href="${cancelUrl}" class="btn">Cancel My Sign-Up</a>

              <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Or copy this link: ${cancelUrl}
              </p>
            </div>
            <div class="footer">
              <p>Kids In Crisis<br>
              1 Salem Street, Cos Cob, CT 06807<br>
              (203) 661-1911</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true, signup })
  } catch (error) {
    console.error('Error creating signup:', error)
    return NextResponse.json({ error: 'Failed to create signup' }, { status: 500 })
  }
}
