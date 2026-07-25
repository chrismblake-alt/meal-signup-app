import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import ApplyForm from './ApplyForm'

export const metadata: Metadata = {
  title: 'Volunteer Application | Kids In Crisis',
  description: 'Kids In Crisis volunteer application',
  // Not linked anywhere and should not be indexed — reached only via a direct link.
  robots: { index: false, follow: false },
}

// Read the legal text at build time so it ships with the prerendered page.
export const dynamic = 'force-static'

function readLegal(fileName: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'legal-text', fileName), 'utf-8')
}

export default function VolunteerApplyPage() {
  return (
    <ApplyForm
      conductStandards={readLegal('conduct-standards.txt')}
      confidentialityStatute={readLegal('confidentiality-statute.txt')}
      residentGuidelines={readLegal('resident-guidelines.txt')}
      mandatedReporter={readLegal('mandated-reporter.txt')}
    />
  )
}
