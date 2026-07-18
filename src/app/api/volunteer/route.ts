import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const submissions = await prisma.volunteerInterest.findMany({
      orderBy: { submittedAt: 'desc' },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Error fetching volunteer submissions:', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}

const NOTIFICATION_RECIPIENTS = [
  'jfebles@kidsincrisis.org',
  'kphillips@kidsincrisis.org',
  'development@kidsincrisis.org',
]

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function row(label: string, value: string | null | undefined): string {
  const display = value && value.trim().length > 0 ? escapeHtml(value).replace(/\n/g, '<br>') : '<em style="color:#888;">(not provided)</em>'
  return `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; width: 200px; font-weight: 600; color: #333;">${escapeHtml(label)}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; color: #333;">${display}</td>
    </tr>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      townCity,
      signupType,
      groupName,
      interests,
      otherInterest,
      availability,
      hearAbout,
      additionalInfo,
    } = body

    if (!name || !email || !phone || !townCity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (signupType !== 'Individual' && signupType !== 'Group') {
      return NextResponse.json({ error: 'Please tell us if you are signing up as an individual or a group' }, { status: 400 })
    }

    if (signupType === 'Group' && (!groupName || !String(groupName).trim())) {
      return NextResponse.json({ error: 'Please provide a group name' }, { status: 400 })
    }

    const interestsArray: string[] = Array.isArray(interests) ? interests.filter((v) => typeof v === 'string') : []

    const submission = await prisma.volunteerInterest.create({
      data: {
        name,
        email,
        phone,
        townCity,
        signupType,
        groupName: signupType === 'Group' ? String(groupName).trim() : null,
        interests: interestsArray,
        otherInterest: otherInterest ? String(otherInterest).trim() : null,
        availability: availability || null,
        hearAbout: hearAbout || null,
        additionalInfo: additionalInfo || null,
      },
    })

    const interestsList = interestsArray.length > 0
      ? `<ul style="margin: 0; padding-left: 20px;">${interestsArray
          .map((i) => `<li>${escapeHtml(i)}${i === 'Other' && submission.otherInterest ? `: ${escapeHtml(submission.otherInterest)}` : ''}</li>`)
          .join('')}</ul>`
      : '<em style="color:#888;">(none selected)</em>'

    const submittedAt = submission.submittedAt.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 640px; margin: 0 auto; padding: 20px; }
          .header { background: #e31837; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .card { background: white; padding: 8px 0; border-radius: 8px; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Volunteer Interest</h1>
            <p style="margin: 8px 0 0; font-size: 14px;">${escapeHtml(name)}</p>
          </div>
          <div class="content">
            <div class="card">
              <table>
                <tbody>
                  ${row('Name', name)}
                  ${row('Email', email)}
                  ${row('Phone', phone)}
                  ${row('Town / City', townCity)}
                  ${row('Signing up as', signupType)}
                  ${signupType === 'Group' ? row('Group name', submission.groupName) : ''}
                </tbody>
              </table>
            </div>

            <p style="font-weight: 600; margin-bottom: 6px;">Volunteering interests</p>
            <div class="card" style="padding: 12px 16px;">${interestsList}</div>

            <div class="card">
              <table>
                <tbody>
                  ${row('Availability', availability)}
                  ${row('How they heard about us', hearAbout)}
                  ${row('Additional info', additionalInfo)}
                  ${row('Submitted at', submittedAt)}
                </tbody>
              </table>
            </div>
          </div>
          <div class="footer">
            <p>Kids In Crisis Volunteer Interest Form</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailResult = await sendEmail({
      to: NOTIFICATION_RECIPIENTS.join(', '),
      subject: `New Volunteer Interest: ${name}`,
      html,
    })

    if (!emailResult.success) {
      console.error('Volunteer notification email failed to send; submission was still saved.', emailResult.error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating volunteer interest submission:', error)
    return NextResponse.json({ error: 'Failed to submit volunteer interest' }, { status: 500 })
  }
}
