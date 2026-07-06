// CIC study-level taxonomy (Levels 4–7). Shared by the Fields/Enquiries
// collections (server) and the enquiry form (client), so it lives outside the
// collection config to stay client-safe.
export const STUDY_LEVELS = [
  { label: 'Diploma (Level 4)', value: 'level-4' },
  { label: 'Higher Diploma (Level 5)', value: 'level-5' },
  { label: 'Graduate (Level 6)', value: 'level-6' },
  { label: 'Postgraduate (Level 7)', value: 'level-7' },
] as const
