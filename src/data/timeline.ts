/**
 * Development timeline — an ordered sequence of stages rather than dates.
 * Add a `date` (e.g. 'Aug 2026') to any entry once you want to show one;
 * entries without a date simply show their step number.
 */
export interface TimelineEntry {
  id: string
  /** Optional, only fill in with a date you can stand behind. */
  date?: string
  command: string
  title: string
  body: string
  /** Code-style aside shown under the entry. */
  aside?: string
  projectId?: string
}

export const timeline: TimelineEntry[] = [
  {
    id: 'zentime',
    command: 'init zentime',
    title: 'Reading the system: ZenTime',
    body: 'Started with Android’s own APIs — UsageStatsManager for screen time and an AccessibilityService to recognise short-form feeds inside other apps.',
    aside: '// lesson: special permissions need a great onboarding flow',
    projectId: 'zentime',
  },
  {
    id: 'omnifile',
    command: 'init omnifile',
    title: 'Going wide on formats: OmniFile',
    body: 'Built a viewer architecture that routes documents, archives, media, e-books, databases and code to dedicated Compose viewers, all offline.',
    aside: '// lesson: most “complex” formats are ZIP + XML underneath',
    projectId: 'omnifile',
  },
  {
    id: 'quran',
    command: 'init quran-companion',
    title: 'Comparing stacks: Quran Companion',
    body: 'Built a Capacitor Android build from React + TypeScript while developing a native Kotlin/Compose module with Media3 audio in the same repository.',
    aside: '// lesson: typography for Arabic and Urdu is its own discipline',
    projectId: 'quran',
  },
  {
    id: 'music',
    command: 'init music-player',
    title: 'Playback: Music Player',
    body: 'An Android music playback app. Details to be added.',
    projectId: 'music',
  },
  {
    id: 'next',
    command: 'git checkout -b next',
    title: 'What’s next',
    body: 'Polishing these apps toward release builds, adding tests, and writing up what each one taught me.',
  },
]
