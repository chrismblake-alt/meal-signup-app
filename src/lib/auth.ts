import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
  })

  return user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function initializeAdmin() {
  const existingAdmin = await prisma.adminUser.findFirst()
  if (!existingAdmin) {
    const email = process.env.ADMIN_EMAIL || 'admin@kidsincrisis.org'
    const password = process.env.ADMIN_PASSWORD || 'changeme'
    const hashedPassword = await hashPassword(password)

    await prisma.adminUser.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    })
    console.log('Admin user created with email:', email)
  }
}
