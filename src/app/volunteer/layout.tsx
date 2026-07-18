import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Volunteer Sign-Up | Kids In Crisis',
  description: 'Sign up to volunteer with Kids In Crisis',
}

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return children
}
