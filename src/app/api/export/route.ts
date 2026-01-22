import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    const where: Record<string, unknown> = { cancelled: false }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const signups = await prisma.mealSignup.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    // Generate CSV
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Bringing', 'Notes', 'Signed Up At']
    const rows = signups.map((signup) => [
      new Date(signup.date).toLocaleDateString('en-US'),
      signup.name,
      signup.email,
      signup.phone,
      signup.bringing,
      signup.notes || '',
      new Date(signup.createdAt).toLocaleString('en-US'),
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="meal-signups-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting signups:', error)
    return NextResponse.json({ error: 'Failed to export signups' }, { status: 500 })
  }
}
