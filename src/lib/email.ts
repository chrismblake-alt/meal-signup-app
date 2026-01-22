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

interface SignupDetails {
  name: string
  date: Date
  bringing: string
  cancelToken: string
}

export function sendConfirmationEmail({ name, date, bringing, cancelToken }: SignupDetails) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const cancelUrl = `${baseUrl}/cancel/${cancelToken}`
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return sendEmail({
    to: '',
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
}

export function sendReminderEmail({ name, date, bringing, cancelToken }: SignupDetails & { email: string }, email: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const cancelUrl = `${baseUrl}/cancel/${cancelToken}`
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return sendEmail({
    to: email,
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
            <p>Hi ${name},</p>

            <p>This is a friendly reminder that you're signed up to provide a meal tomorrow for Kids In Crisis.</p>

            <div class="highlight">
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Bringing:</strong> ${bringing}</p>
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
}
