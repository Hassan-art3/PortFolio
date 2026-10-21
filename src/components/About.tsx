import { m } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { ease, inViewSoon } from '../motion/tokens'
import { Reveal } from './Reveal'
import './About.css'

const principles = [
  {
    cmd: 'start --from problem',
    title: 'Start from a real problem',
    body: 'Each app targets one specific problem: too many file formats, too much short-form scrolling, too many apps for one study session.',
  },
  {
    cmd: 'build --close-to-platform',
    title: 'Work close to the platform',
    body: 'I reach for Android’s own APIs first — UsageStatsManager, AccessibilityService, PdfRenderer, the Storage Access Framework — and add libraries only where they earn their place.',
  },
  {
    cmd: 'ai --assist --review',
    title: 'Use AI tools deliberately',
    body: 'AI-assisted tools help me scaffold, debug and explore faster. I still read, test and restructure what they produce, and the case studies note what still needs fixing.',
  },
]

export function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">
          <div className="about__intro">
            <Reveal>
              <p className="eyebrow">
                <b>05</b> / About
              </p>
            </Reveal>
            <div className="about__title-wrap">
              <SplitText
                id="about-title"
                className="section-title about__title"
                parts={['I learn by ', { text: 'building real apps.', className: 'serif' }]}
              />
              {/* Hand-drawn underline that draws itself once the title is in view */}
              <svg className="about__scribble" viewBox="0 0 300 24" fill="none" aria-hidden="true" preserveAspectRatio="none">
                <m.path
                  d="M4 16 C 60 6, 120 4, 180 10 S 270 18, 296 8"
                  stroke="var(--accent)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={inViewSoon}
                  transition={{ duration: 0.9, ease: ease.inOut, delay: 0.7 }}
                />
              </svg>
            </div>
          </div>

          <Reveal className="about__text" delay={80}>
            <p>
              I build Android applications, and most of what I know comes from building them: wiring up Room databases,
              fighting with permissions, rendering PDFs page by page, and figuring out why something that worked yesterday
              doesn’t today.
            </p>
            <p>
              I care about the parts users notice without thinking about them — a clear permissions flow, the right
              typeface for Arabic text, a viewer that opens instantly. And I care about the parts they never see: clean
              boundaries between data and UI, work kept off the main thread, code I can still understand a month later.
            </p>
            <p>
              AI-assisted development is part of my everyday workflow. It speeds up the routine work, which leaves more
              time for the problems that need careful thought.
            </p>
          </Reveal>
        </div>

        <ol className="about__principles">
          {principles.map((p, i) => (
            <Reveal
              as="li"
              key={p.title}
              className="about__principle"
              variant={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}
              delay={i * 90}
            >
              <p className="mono about__cmd">
                <span>$</span> {p.cmd}
              </p>
              <h3>{p.title}</h3>
              <p className="about__body">{p.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
