// Shared definition of the seasonal "Holiday Central" volunteer interests.
// Used by the /volunteer form (rendering the checkboxes), the /api/volunteer
// route (notification email), and the admin dashboard so the labels stay in
// sync and holiday selections can be cleanly separated from regular interests.
//
// Holiday selections are stored in the same `interests` array as the tier
// interests; these values are how we tell them apart for display/labeling.
export const HOLIDAY_CENTRAL_INTERESTS = [
  {
    value: 'Sponsor a Family',
    label: 'Sponsor a Family',
    description: 'Fulfill a family’s wish list: shirt, pants, a coat, and a toy for each child.',
  },
  {
    value: 'Sponsor a Holiday Dinner',
    label: 'Sponsor a Holiday Dinner',
    description: 'Support holiday dinners for the children at our SafeHaven Shelters.',
  },
  {
    value: 'Donate Gift Cards',
    label: 'Donate Gift Cards',
    description: 'Any amount toward Amazon, Visa, Target, Old Navy, or similar for last-minute needs.',
  },
  {
    value: 'Create an Office Giving Tree',
    label: 'Create an Office Giving Tree',
    description: 'Hang one wish per child for team involvement.',
  },
] as const

export const HOLIDAY_CENTRAL_VALUES: string[] = HOLIDAY_CENTRAL_INTERESTS.map((i) => i.value)
