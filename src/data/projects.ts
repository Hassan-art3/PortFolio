/**
 * Project data — the single source of truth for cards, case studies,
 * the hero showcase and the timeline.
 *
 * Every technical statement here was checked against the project source
 * (build files, manifests, Kotlin/TypeScript sources). Fields marked
 * `EDIT:` are drafts or placeholders you should rewrite in your own words.
 *
 * To add real screenshots: drop images into /public/projects/<id>/ and add
 * `{ kind: 'image', src: '/projects/<id>/file.webp', alt: '…' }` to `screens`.
 * Phone screenshots look best at roughly 9:19.5 (e.g. 585×1266).
 */

export type Screen =
  | { kind: 'image'; src: string; alt: string }
  /** A labelled UI schematic drawn from the app's real navigation structure. */
  | { kind: 'schematic'; variant: SchematicVariant; alt: string }

export type SchematicVariant = 'omnifile' | 'zentime' | 'music'

export type ProjectIcon =
  | { kind: 'image'; src: string }
  | { kind: 'omnifile' }
  | { kind: 'monogram'; text: string }

export type ProjectLink = { label: string; href: string }

export interface CaseStudy {
  problem: string
  users: string
  features: string[]
  implementation: { summary: string; points: string[] }
  uiux: string[]
  challenges: { title: string; body: string }[]
  learned: string[]
  next: string[]
  /** Small key/value facts shown in the case-study sidebar. */
  facts: { label: string; value: string }[]
}

export interface Project {
  id: string
  index: string
  name: string
  /** One-sentence description for the card. */
  tagline: string
  /** Development stage, shown as a small label. */
  stage: string
  /** Accent used for this project's visual identity. */
  accent: string
  icon: ProjectIcon
  tags: string[]
  /** Only add links with real URLs — empty list renders nothing. */
  links: ProjectLink[]
  screens: Screen[]
  /** True when the project details have not been filled in yet. */
  placeholder?: boolean
  caseStudy: CaseStudy
}

export const projects: Project[] = [
  {
    id: 'omnifile',
    index: '01',
    name: 'OmniFile',
    tagline:
      'A universal file opener for Android that routes documents, media, archives, e-books and code to purpose-built viewers — all offline.',
    stage: 'In development',
    accent: '#5B9BF0',
    icon: { kind: 'omnifile' },
    tags: ['Kotlin', 'Jetpack Compose', 'Material 3', 'Room', 'WorkManager', 'SAF'],
    links: [],
    screens: [
      {
        kind: 'schematic',
        variant: 'omnifile',
        alt: 'Schematic of the OmniFile home screen with Home, Files, Categories, Favorites and Recent tabs',
      },
    ],
    caseStudy: {
      problem:
        'Phones collect files in dozens of formats — PDFs, Office documents, EPUBs, ZIPs, SQLite databases, source code. Opening each one usually means hunting for a separate app per format, many of them ad-heavy or online-only.',
      users:
        'Android users who receive or download mixed file types and want to open them in one place without an internet connection.',
      features: [
        'File browsing through the Storage Access Framework plus a MediaStore scanner for indexing device files.',
        'A viewer dispatcher that picks a dedicated viewer by file type: PDF, EPUB, DOCX / ODT / RTF / PPTX, spreadsheets, plain text, source code, images, audio, video, archives, SQLite databases and fonts.',
        'A generic fallback viewer with metadata and a hex preview for anything unrecognised.',
        'Home, Files, Categories, Favorites and Recent tabs, with search and a detailed file-info screen.',
        'Room-backed file metadata, an LRU memory cache for thumbnails, and background indexing with WorkManager.',
        'Theme and viewer preferences persisted with DataStore, including Material You dynamic colour on Android 12+.',
      ],
      implementation: {
        summary:
          'A single-activity Jetpack Compose app (~50 Kotlin files) organised into data, domain and presentation packages. A central FileTypeRegistry maps extensions to categories and viewer types.',
        points: [
          'PDF pages are rendered on demand with Android’s PdfRenderer instead of a third-party PDF engine.',
          'DOCX and PPTX are ZIP containers, so the document parser opens them with java.util.zip and reads the XML with Jsoup — no heavy Office library.',
          'Archives are listed with Apache Commons Compress; EPUB chapters are parsed with Jsoup.',
          'File I/O runs on Kotlin coroutines with Dispatchers.IO to keep the UI thread free.',
          'Room (via KSP), Navigation Compose, Coil for images, DataStore for settings, WorkManager for indexing.',
          'minSdk 26, targetSdk 35, Gradle Kotlin DSL with a version catalog.',
        ],
      },
      uiux: [
        'Bottom navigation keeps the five most common entry points one tap away.',
        'Each viewer is tailored to its format (page navigation for PDFs, line numbers for code, font samples for fonts) rather than one generic preview.',
        'Material 3 theming with light, dark and dynamic colour so the app feels native on modern Android.',
      ],
      challenges: [
        {
          title: 'One entry point, many formats',
          body: 'Every file has to land in the right viewer. A registry of extensions → viewer types, plus a dispatcher composable, keeps that routing in one place instead of scattered across screens.',
        },
        {
          title: 'Parsing Office files without a heavy dependency',
          body: 'Instead of bundling a large Office SDK, the parser unzips DOCX/PPTX packages and walks their XML, turning paragraphs, headings, tables and lists into a simple document model that Compose can render.',
        },
        {
          title: 'Errors inside composables',
          body: 'Compose functions can’t be wrapped in a plain try/catch, so each viewer loads its content in a LaunchedEffect and reports failures to a shared error state instead of crashing the app.',
        },
      ],
      // EDIT: rewrite these in your own words.
      learned: [
        'How much of Android’s file story runs through content URIs and the Storage Access Framework rather than raw file paths.',
        'That many “complex” formats are approachable once you treat them as ZIP + XML.',
      ],
      next: [
        'Rename the package from its working name (com.freebuff.filemanager) to match the OmniFile brand.',
        'Move screen state into ViewModels so viewers survive configuration changes more cleanly.',
        'Add automated tests around FileTypeRegistry and the document parser.',
      ],
      facts: [
        { label: 'Platform', value: 'Android · minSdk 26' },
        { label: 'UI', value: 'Jetpack Compose' },
        { label: 'Persistence', value: 'Room · DataStore' },
        { label: 'Stage', value: 'In development' },
      ],
    },
  },
  {
    id: 'zentime',
    index: '02',
    name: 'ZenTime',
    tagline:
      'A digital-wellbeing app that tracks screen time, sets app limits and can block short-form video feeds during focus modes.',
    stage: 'In development',
    accent: '#2EC4B0',
    icon: { kind: 'image', src: '/projects/zentime/logo.webp' },
    tags: ['Kotlin', 'Jetpack Compose', 'UsageStatsManager', 'AccessibilityService', 'Room', 'DataStore'],
    links: [],
    screens: [
      {
        kind: 'schematic',
        variant: 'zentime',
        alt: 'Schematic of the ZenTime dashboard with Dashboard, Apps, Shorts, Focus and Insights tabs',
      },
    ],
    caseStudy: {
      problem:
        'Short-form feeds — YouTube Shorts, Instagram Reels, TikTok — are built for endless scrolling. Standard screen-time tools report totals per app, but can’t tell intentional use of an app apart from getting pulled into its short-video feed.',
      users:
        'People who want to keep using apps like YouTube or Instagram for their useful parts while cutting down on short-form scrolling.',
      features: [
        'Daily usage statistics, usage sessions, a timeline and history views built on UsageStatsManager.',
        'Per-app time limits stored in Room.',
        'Focus modes that block selected platforms or apps, or allow only an allow-list of apps.',
        'Short-form detection for YouTube Shorts, Instagram Reels, TikTok, Snapchat and Threads through an AccessibilityService.',
        'A full-screen block overlay, temporary unlocks, and a log of blocked attempts.',
        'Onboarding and a permissions screen that walks through usage access, accessibility and overlay permissions.',
      ],
      implementation: {
        summary:
          'A Jetpack Compose app (~50 Kotlin files) with ViewModels per screen, a Room database for usage, limits, focus modes and goals, and a content-blocking engine that runs inside an accessibility service.',
        points: [
          'Each platform has its own detector implementing a shared ContentDetector interface; detectors inspect the accessibility node tree and return a result with a confidence level.',
          'A BlockingPolicyEngine combines the detection result with active focus modes, app-limit state and any temporary unlock to decide whether to block.',
          'UsageStatsProvider reads both aggregated daily stats and raw usage events to reconstruct sessions.',
          'Room (via KSP), DataStore preferences, Navigation Compose, Coroutines; minSdk 24, targetSdk 36.',
          'Roborazzi is configured for Compose screenshot tests.',
        ],
      },
      uiux: [
        'Onboarding explains why each sensitive permission is needed before asking for it.',
        'Focus modes carry their own name, icon and colour so they are easy to recognise at a glance.',
        'Blocking uses a dedicated overlay with a clear explanation instead of silently closing the app.',
      ],
      challenges: [
        {
          title: 'Detecting a feed, not an app',
          body: 'Blocking all of YouTube is easy; blocking only Shorts means recognising a specific screen inside another app. Each detector reads that app’s accessibility tree, and the platform-specific logic is isolated so a UI change in one app doesn’t break the others.',
        },
        {
          title: 'Combining rules predictably',
          body: 'Focus modes, allow-lists, block-lists, app limits and temporary unlocks can all apply at once. Evaluating them in a fixed order in one policy engine keeps the outcome easy to reason about.',
        },
        {
          title: 'Sensitive permissions',
          body: 'Usage access, accessibility and draw-over-apps are all special permissions granted from system settings, so the app needs a clear, step-by-step permissions flow.',
        },
      ],
      // EDIT: rewrite these in your own words.
      learned: [
        'How Android’s accessibility APIs expose another app’s UI, and how fragile that can be across app updates.',
        'Designing permission flows that earn trust before asking for powerful access.',
      ],
      next: [
        'Replace the template package name (com.example) with a proper application ID.',
        'Remove networking dependencies that are declared but not used.',
        'Write screenshot tests for the main screens now that Roborazzi is set up.',
      ],
      facts: [
        { label: 'Platform', value: 'Android · minSdk 24' },
        { label: 'UI', value: 'Jetpack Compose' },
        { label: 'System APIs', value: 'UsageStats · Accessibility' },
        { label: 'Stage', value: 'In development' },
      ],
    },
  },
  {
    id: 'quran',
    index: '03',
    name: 'Quran Companion',
    tagline:
      'A Quran reading app with word-by-word study, translations, tafsir, recitation audio and a Hifz memorisation mode.',
    stage: 'In development',
    accent: '#D9B440',
    icon: { kind: 'monogram', text: 'ق' },
    tags: ['TypeScript', 'React', 'Capacitor', 'Tailwind CSS', 'Dexie', 'Kotlin'],
    links: [],
    screens: [
      { kind: 'image', src: '/projects/quran/screen-home.webp', alt: 'Quran Companion home screen with a resume-reading card and the daily ayah' },
      { kind: 'image', src: '/projects/quran/screen-reader.webp', alt: 'Quran Companion reader showing Al-Fatihah with English and Urdu translations' },
      { kind: 'image', src: '/projects/quran/screen-hifz.webp', alt: 'Quran Companion Hifz tool with verse audio looping controls' },
    ],
    caseStudy: {
      problem:
        'Reading, understanding and memorising the Quran usually means switching between several apps — one for the Mushaf, one for translation and tafsir, another for recitation and memorisation practice.',
      users:
        'Readers who want Arabic text, translation, word meanings and recitation together, and students working on Hifz.',
      features: [
        'Reading by Surah, Juz or line, with a “resume where you left off” card.',
        'Tap any word to see its meaning and other occurrences in the Quran.',
        'English (Sahih International) and Urdu (Jalandhry) translations alongside the Arabic.',
        'Tafsir, a hadith reader, a daily ayah, verse notes, bookmarks, sharing and search.',
        'Hifz mode with hide-text toggles and a verse audio loop with configurable repeats.',
        'Recitation playback, Islamic utilities including Qibla, and an offline banner when the connection drops.',
      ],
      implementation: {
        summary:
          'The current build is a React + TypeScript app packaged for Android with Capacitor. The repository also contains a parallel native module written in Kotlin with Jetpack Compose.',
        points: [
          'Layered into data, domain and presentation folders, with repository interfaces for Quran text, translations, tafsir, hadith, audio, search and study data.',
          'Text, translations and word data come from the Quran.com and AlQuran.cloud APIs; recitation audio is streamed from public recitation CDNs.',
          'Local data (bookmarks, notes, progress) is stored in IndexedDB through Dexie.',
          'Built with Vite and Tailwind CSS 4; Capacitor 8 produces the Android project.',
          'The native module (~45 Kotlin files) uses Compose, Room, DataStore, OkHttp and Media3 ExoPlayer with a media session for background recitation.',
        ],
      },
      uiux: [
        'A black-and-gold palette that keeps attention on the text.',
        'Dedicated Arabic and Urdu typefaces (Amiri Quran, Noto Nastaliq Urdu) instead of system fallbacks.',
        'A six-tab bottom bar — Quran, Hadith, Hifz Tool, Tools & Qibla, Saved, Settings — so study tools sit next to reading.',
      ],
      challenges: [
        {
          title: 'Mixing scripts and directions',
          body: 'Arabic, Urdu and English appear on the same screen with different directions, typefaces and line heights. Each block gets its own type settings so none of them feel like an afterthought.',
        },
        {
          title: 'Many content sources',
          body: 'Text, translations, word data and audio come from different APIs. Repository interfaces hide those differences from the UI, which also makes a source easy to swap.',
        },
        {
          title: 'Choosing a stack',
          body: 'Keeping a web build and a native Kotlin module in one repository made it possible to compare a cross-platform approach with native Compose for the same feature set.',
        },
      ],
      // EDIT: rewrite these in your own words.
      learned: [
        'Typography for Arabic and Urdu needs as much care as layout.',
        'Clean repository boundaries pay off when several APIs feed one screen.',
      ],
      next: [
        'Fix the Hifz screen’s translation card, which currently shows a fallback message instead of the translation.',
        'Decide between the Capacitor build and the native Kotlin module and consolidate on one.',
        'Remove dependencies that are declared but unused.',
      ],
      facts: [
        { label: 'Platform', value: 'Android (Capacitor)' },
        { label: 'UI', value: 'React · Tailwind' },
        { label: 'Native module', value: 'Kotlin · Compose · Media3' },
        { label: 'Stage', value: 'In development' },
      ],
    },
  },
  {
    // EDIT: the music player source wasn't available when this site was
    // built, so everything below is a placeholder. Replace it with real details.
    id: 'music',
    index: '04',
    name: 'Music Player',
    tagline: 'An Android music playback app. Project details coming soon.',
    stage: 'Details coming soon',
    accent: '#B39BF5',
    icon: { kind: 'monogram', text: '♪' },
    tags: [],
    links: [],
    screens: [
      { kind: 'schematic', variant: 'music', alt: 'Placeholder for the music player screenshots' },
    ],
    placeholder: true,
    caseStudy: {
      problem: '',
      users: '',
      features: [],
      implementation: { summary: '', points: [] },
      uiux: [],
      challenges: [],
      learned: [],
      next: [],
      facts: [
        { label: 'Platform', value: 'Android' },
        { label: 'Stage', value: 'Details coming soon' },
      ],
    },
  },
]

export const getProject = (id: string) => projects.find((p) => p.id === id)
