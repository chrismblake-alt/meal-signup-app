import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'main' },
    })

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: 'main',
          kidCountMin: 8,
          kidCountMax: 12,
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { kidCountMin, kidCountMax } = await request.json()

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: { kidCountMin, kidCountMax },
      create: { id: 'main', kidCountMin, kidCountMax },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
