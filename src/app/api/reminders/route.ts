import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret key check for cron job security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get tomorrow's date
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

    // Find all signups for tomorrow that haven't received reminders
    const signups = await prisma.mealSignup.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        cancelled: false,
        reminderSent: false,
      },
    })

    const results = []

    for (const signup of signups) {
      const formattedDate = new Date(signup.date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
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
                  <p><strong>Bringing:</strong> ${signup.bringing}</p>
                </div>

                <p><strong>Delivery Time:</strong> 5:00 PM - 6:00 PM</p>
                <p><strong>Location:</strong> 1 Salem Street, Cos Cob, CT 06807</p>

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
        results.push({ id: signup.id, email: signup.email, status: 'sent' })
      } else {
        results.push({ id: signup.id, email: signup.email, status: 'failed' })
      }
    }

    return NextResponse.json({
      success: true,
      remindersProcessed: signups.length,
      results,
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}
