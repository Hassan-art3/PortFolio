/**
 * Skills & tools — grouped by where they show up in real project code.
 * `usedIn` lists project ids so each item is traceable to evidence.
 * Add or remove items freely; nothing here claims a proficiency level.
 */
export interface SkillItem {
  name: string
  usedIn: string[]
  note?: string
}

export interface SkillGroup {
  id: string
  label: string
  /** Terminal-style comment shown above the group. */
  comment: string
  items: SkillItem[]
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'android',
    label: 'Android & Kotlin',
    comment: 'native apps',
    items: [
      { name: 'Kotlin', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'Jetpack Compose', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'Material 3', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'Navigation Compose', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'Kotlin Coroutines', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'ViewModel', usedIn: ['zentime'] },
    ],
  },
  {
    id: 'data',
    label: 'Data & storage',
    comment: 'persistence',
    items: [
      { name: 'Room', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'DataStore', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'WorkManager', usedIn: ['omnifile'] },
      { name: 'Storage Access Framework', usedIn: ['omnifile'] },
      { name: 'IndexedDB · Dexie', usedIn: ['quran'] },
    ],
  },
  {
    id: 'platform',
    label: 'Platform APIs',
    comment: 'system integration',
    items: [
      { name: 'UsageStatsManager', usedIn: ['zentime'] },
      { name: 'AccessibilityService', usedIn: ['zentime'] },
      { name: 'PdfRenderer', usedIn: ['omnifile'] },
      { name: 'Media3 · ExoPlayer', usedIn: ['quran'] },
      { name: 'MediaStore', usedIn: ['omnifile'] },
    ],
  },
  {
    id: 'web',
    label: 'Cross-platform & web',
    comment: 'hybrid builds',
    items: [
      { name: 'TypeScript', usedIn: ['quran'] },
      { name: 'React', usedIn: ['quran'] },
      { name: 'Capacitor', usedIn: ['quran'] },
      { name: 'Tailwind CSS', usedIn: ['quran'] },
      { name: 'Vite', usedIn: ['quran'] },
    ],
  },
  {
    id: 'libs',
    label: 'Libraries',
    comment: 'third-party',
    items: [
      { name: 'Coil', usedIn: ['omnifile', 'zentime'] },
      { name: 'Jsoup', usedIn: ['omnifile'] },
      { name: 'Apache Commons Compress', usedIn: ['omnifile'] },
      { name: 'OkHttp', usedIn: ['quran'] },
    ],
  },
  {
    id: 'workflow',
    label: 'Tooling & workflow',
    comment: 'how I build',
    items: [
      { name: 'Android Studio', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'Gradle Kotlin DSL', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'Version catalogs', usedIn: ['omnifile', 'zentime'] },
      { name: 'KSP', usedIn: ['omnifile', 'zentime', 'quran'] },
      { name: 'AI-assisted development', usedIn: ['omnifile', 'zentime', 'quran'], note: 'Google AI Studio, Freebuff' },
    ],
  },
]
