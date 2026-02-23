import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error('Email error:', error)
    return { success: false, error }
  }
}

interface BatchSignupDetails {
  name: string
  email: string
  bringing: string
  kidCountDisplay: string
  signups: Array<{
    date: Date
    location: string
    cancelToken: string
  }>
}

export function sendBatchConfirmationEmail({ name, email, bringing, kidCountDisplay, signups }: BatchSignupDetails) {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim()
  const count = signups.length

  const dateRows = signups
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((s) => {
      const formatted = s.date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const cancelUrl = `${baseUrl}/cancel/${s.cancelToken}`
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatted}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${s.location}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <a href="${cancelUrl}" style="color: #e31837; text-decoration: underline; font-size: 13px;">Cancel</a>
          </td>
        </tr>
      `
    })
    .join('')

  const firstDate = signups
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0]
    .date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return sendEmail({
    to: email,
    subject: `Meal Sign-Ups Confirmed - ${count} date${count > 1 ? 's' : ''} starting ${firstDate}`,
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
            <p>Your meal sign-ups have been confirmed for Kids In Crisis. You've signed up for <strong>${count} date${count > 1 ? 's' : ''}</strong>!</p>

            <div class="highlight">
              <p><strong>Bringing:</strong> ${bringing}</p>
            </div>

            <div class="highlight" style="padding: 0; overflow: hidden;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 10px; text-align: left;">Date</th>
                    <th style="padding: 10px; text-align: left;">Location</th>
                    <th style="padding: 10px; text-align: left;"></th>
                  </tr>
                </thead>
                <tbody>
                  ${dateRows}
                </tbody>
              </table>
            </div>

            <div style="background: #fff3cd; border: 2px solid #e31837; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #333;"><strong>Please prepare meals for approximately</strong></p>
              <p style="margin: 8px 0; font-size: 32px; font-weight: bold; color: #e31837;">${kidCountDisplay} children</p>
              <p style="margin: 0; font-size: 14px; color: #666;">per delivery</p>
            </div>

            <p>The kids and staff are looking forward to your meals! Please plan to deliver between 12:00 PM and 5:00 PM.</p>

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

            <p>Need to cancel a date? Use the cancel links in the table above for each individual date.</p>
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
}