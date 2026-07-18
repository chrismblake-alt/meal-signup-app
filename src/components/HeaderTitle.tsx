'use client'

import { usePathname } from 'next/navigation'

export default function HeaderTitle() {
  const pathname = usePathname() || ''
  const label = pathname.startsWith('/volunteer') ? 'Volunteer Sign-Up' : 'Meal Sign-Up'
  return <p className="text-sm text-gray-500">{label}</p>
}
