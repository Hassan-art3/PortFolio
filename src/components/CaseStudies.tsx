import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { AnimatePresence, m, type Variants } from 'motion/react'
import { projects, type Project } from '../data/projects'
import { SplitText } from '../motion/SplitText'
import { dur, ease, spring, inView, inViewSoon } from '../motion/tokens'
import { PhoneMockup } from './PhoneMockup'
import { ProjectIcon } from './ProjectIcon'
import { Reveal } from './Reveal'
import './CaseStudies.css'

const HASH_PREFIX = '#case-'

function idFromHash(): string | null {
  const { hash } = window.location
  if (!hash.startsWith(HASH_PREFIX)) return null
  const id = hash.slice(HASH_PREFIX.length)
  return projects.some((p) => p.id === id) ? id : null
}

export function CaseStudies() {
  const [activeId, setActiveId] = useState<string>(() => idFromHash() ?? projects[0].id)
  const [direction, setDirection] = useState(1)
  /** Bumped when a project card link brings the user here, to replay the "arrival" accent. */
  const [arrival, setArrival] = useState(0)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const activeRef = useRef(activeId)
  const change = (id: string) => {
    const from = projects.findIndex((p) => p.id === activeRef.current)
    const to = projects.findIndex((p) => p.id === id)
    if (to !== from) setDirection(to > from ? 1 : -1)
    activeRef.current = id
    setActiveId(id)
  }

  // Links like #case-zentime anywhere on the page select that tab.
  useEffect(() => {
    const onHash = () => {
      const id = idFromHash()
      if (id) {
        change(id)
        setArrival((n) => n + 1)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const select = (id: string, focus = false) => {
    change(id)
    history.replaceState(null, '', `${HASH_PREFIX}${id}`)
    if (focus) tabRefs.current[id]?.focus()
  }

  // Roving tab focus with arrow keys, per WAI-ARIA tabs pattern.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = projects.findIndex((p) => p.id === activeId)
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % projects.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + projects.length) % projects.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = projects.length - 1
    if (next >= 0) {
      e.preventDefault()
      select(projects[next].id, true)
    }
  }

  const active = projects.find((p) => p.id === activeId) ?? projects[0]

  return (
    <section id="case-studies" className="section cases" aria-labelledby="cases-title">
      {/* Scroll targets for #case-<id> links */}
      {projects.map((p) => (
        <span key={p.id} id={`case-${p.id}`} className="cases__anchor" aria-hidden="true" />
      ))}

      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">
              <b>02</b> / Case studies
            </p>
          </Reveal>
          <SplitText
            id="cases-title"
            className="section-title"
            parts={['How each app ', { text: 'actually works.', className: 'serif' }]}
          />
          <Reveal delay={150}>
            <p className="section-lede">
              The problem, the people it’s for, how it’s built, and what’s still left to do — written from the source
              code, not from a wish list.
            </p>
          </Reveal>
        </div>

        <Reveal variant="scale">
          <div className="cases__tabs" role="tablist" aria-label="Case studies" onKeyDown={onKeyDown}>
            {projects.map((p) => {
              const selected = p.id === activeId
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    tabRefs.current[p.id] = el
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${p.id}`}
                  aria-selected={selected}
                  aria-controls={`panel-${p.id}`}
                  tabIndex={selected ? 0 : -1}
                  className="cases__tab"
                  style={{ '--accent-p': p.accent } as CSSProperties}
                  onClick={() => select(p.id)}
                >
                  {selected && <m.span className="cases__tab-bg" layoutId="case-tab" transition={spring.indicator} />}
                  <span className="mono">{p.index}</span>
                  <span>{p.name}</span>
                </button>
              )
            })}
          </div>
        </Reveal>

        <div className="cases__stage">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <CasePanel key={active.id} project={active} direction={direction} arrival={arrival} />
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

const sections = [
  { id: 'problem', label: 'Problem' },
  { id: 'users', label: 'Intended users' },
  { id: 'features', label: 'Core features' },
  { id: 'implementation', label: 'Implementation' },
  { id: 'uiux', label: 'UI / UX decisions' },
  { id: 'challenges', label: 'Engineering challenges' },
  { id: 'reflection', label: 'Learned & next' },
]

const panel: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 48 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.45, ease: ease.expo } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -32, transition: { duration: 0.2, ease: ease.inOut } }),
}

const factList: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }
const factItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.standard, ease: ease.out } },
}
const listStagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }
const listItem: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: dur.standard, ease: ease.out } },
}

function CasePanel({ project, direction, arrival }: { project: Project; direction: number; arrival: number }) {
  const cs = project.caseStudy
  const style = { '--accent-p': project.accent } as CSSProperties
  const images = project.screens.filter((s) => s.kind === 'image')
  const [current, setCurrent] = useState(sections[0].id)

  // Table-of-contents scroll-spy for this panel's blocks.
  useEffect(() => {
    if (project.placeholder) return
    const els = sections
      .map((s) => document.getElementById(`${project.id}-${s.id}`))
      .filter((el): el is HTMLElement => el !== null)
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id.slice(project.id.length + 1))
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [project.id, project.placeholder])

  return (
    <m.div
      role="tabpanel"
      id={`panel-${project.id}`}
      aria-labelledby={`tab-${project.id}`}
      tabIndex={0}
      className="case"
      style={style}
      custom={direction}
      variants={panel}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <header className="case__header">
        {/* Accent sweep replays whenever a project card sends the user here */}
        <m.span
          key={arrival}
          className="case__sweep"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: [1, 1, 0] }}
          transition={{ duration: 1.2, ease: ease.expo, opacity: { times: [0, 0.7, 1], duration: 1.4 } }}
        />
        <div className="case__identity">
          <m.span
            className="case__icon"
            initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}
          >
            <ProjectIcon project={project} size={64} />
          </m.span>
          <div>
            <m.h3
              className="case__name"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.reveal, ease: ease.out, delay: 0.12 }}
            >
              {project.name}
            </m.h3>
            <m.p
              className="case__tagline"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.reveal, ease: ease.out, delay: 0.2 }}
            >
              {project.tagline}
            </m.p>
          </div>
        </div>
        <m.dl className="case__facts" variants={factList} initial="hidden" animate="visible">
          {cs.facts.map((f) => (
            <m.div key={f.label} variants={factItem}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </m.div>
          ))}
        </m.dl>
      </header>

      {project.placeholder ? (
        <div className="case__empty">
          <p className="mono case__empty-cmd">
            <span>$</span> cat case-study.md<span className="case__caret" aria-hidden="true" />
          </p>
          <p className="case__empty-title">This case study hasn’t been written yet.</p>
          <p className="case__empty-body">
            The {project.name} write-up is coming soon. It will follow the same structure as the others: problem, users,
            features, implementation, design decisions, challenges and next steps.
          </p>
        </div>
      ) : (
        <div className="case__body">
          <nav className="case__toc" aria-label={`${project.name} case study sections`}>
            <ol>
              {sections.map((s, i) => {
                const on = current === s.id
                return (
                  <li key={s.id}>
                    <a href={`#${project.id}-${s.id}`} className={on ? 'is-current' : undefined} aria-current={on ? 'location' : undefined}>
                      {on && <m.span className="case__toc-bar" layoutId={`toc-${project.id}`} transition={spring.indicator} />}
                      <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                      {s.label}
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="case__content">
            <CaseBlock id={`${project.id}-problem`} n="01" title="The problem">
              <p className="case__lead">{cs.problem}</p>
            </CaseBlock>

            <CaseBlock id={`${project.id}-users`} n="02" title="Intended users">
              <p>{cs.users}</p>
            </CaseBlock>

            <CaseBlock id={`${project.id}-features`} n="03" title="Core features">
              <AnimatedList items={cs.features} className="case__list" />
            </CaseBlock>

            {images.length > 0 && (
              <m.div
                className="case__gallery"
                aria-label={`${project.name} screenshots`}
                initial={{ clipPath: 'inset(0 0 100% 0 round 20px)' }}
                whileInView={{ clipPath: 'inset(0 0 0% 0 round 20px)' }}
                viewport={inView}
                transition={{ duration: 1, ease: ease.expo }}
              >
                {images.map((s, i) => (
                  <m.div
                    key={i}
                    className="case__shot-wrap"
                    initial={{ y: 80, rotate: (i - 1) * 4, opacity: 0 }}
                    whileInView={{ y: 0, rotate: 0, opacity: 1 }}
                    viewport={inViewSoon}
                    transition={{ type: 'spring', stiffness: 120, damping: 17, delay: 0.25 + i * 0.1 }}
                  >
                    <PhoneMockup screen={s} className="case__shot" />
                  </m.div>
                ))}
              </m.div>
            )}

            <CaseBlock id={`${project.id}-implementation`} n="04" title="Technical implementation">
              <p>{cs.implementation.summary}</p>
              <AnimatedList items={cs.implementation.points} className="case__code" />
            </CaseBlock>

            <CaseBlock id={`${project.id}-uiux`} n="05" title="UI / UX decisions">
              <AnimatedList items={cs.uiux} className="case__list" />
            </CaseBlock>

            <CaseBlock id={`${project.id}-challenges`} n="06" title="Engineering challenges">
              <m.div
                className="case__challenges"
                variants={listStagger}
                initial="hidden"
                whileInView="visible"
                viewport={inView}
              >
                {cs.challenges.map((c, i) => (
                  <m.article
                    key={c.title}
                    className="case__challenge"
                    variants={{
                      hidden: { opacity: 0, y: 24, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: dur.reveal, ease: ease.out } },
                    }}
                  >
                    <span className="case__challenge-n mono">0{i + 1}</span>
                    <h5>{c.title}</h5>
                    <p>{c.body}</p>
                  </m.article>
                ))}
              </m.div>
            </CaseBlock>

            <CaseBlock id={`${project.id}-reflection`} n="07" title="What I learned & what’s next">
              <div className="case__reflect">
                <div>
                  <p className="case__reflect-label mono">// learned</p>
                  <AnimatedList items={cs.learned} className="case__list" />
                </div>
                <div>
                  <p className="case__reflect-label mono">// next</p>
                  <AnimatedList items={cs.next} className="case__list case__list--todo" />
                </div>
              </div>
            </CaseBlock>
          </div>
        </div>
      )}
    </m.div>
  )
}

function AnimatedList({ items, className }: { items: string[]; className: string }) {
  return (
    <m.ul
      className={className}
      variants={listStagger}
      initial="hidden"
      whileInView="visible"
      viewport={inViewSoon}
    >
      {items.map((it) => (
        <m.li key={it} variants={listItem}>
          {it}
        </m.li>
      ))}
    </m.ul>
  )
}

function CaseBlock({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <m.section
      id={id}
      className="case__block"
      aria-labelledby={`${id}-h`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={inView}
      transition={{ duration: dur.reveal, ease: ease.out }}
    >
      <h4 id={`${id}-h`} className="case__block-title">
        <span className="mono">{n}</span>
        {title}
        <m.span
          className="case__block-rule"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={inViewSoon}
          transition={{ duration: 1, ease: ease.expo, delay: 0.2 }}
        />
      </h4>
      <div className="case__block-body">{children}</div>
    </m.section>
  )
}
