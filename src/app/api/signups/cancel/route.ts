import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const signup = await prisma.mealSignup.findUnique({
      where: { cancelToken: token },
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        bringing: true,
        cancelled: true,
      },
    })

    if (!signup) {
      return NextResponse.json({ error: 'Sign-up not found' }, { status: 404 })
    }

    return NextResponse.json(signup)
  } catch (error) {
    console.error('Error fetching signup:', error)
    return NextResponse.json({ error: 'Failed to fetch signup' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    const signup = await prisma.mealSignup.findUnique({
      where: { cancelToken: token },
    })

    if (!signup) {
      return NextResponse.json({ error: 'Sign-up not found' }, { status: 404 })
    }

    if (signup.cancelled) {
      return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
    }

    await prisma.mealSignup.update({
      where: { cancelToken: token },
      data: { cancelled: true, cancelledAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelling signup:', error)
    return NextResponse.json({ error: 'Failed to cancel signup' }, { status: 500 })
  }
}
