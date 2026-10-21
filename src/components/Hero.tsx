import { useRef, type CSSProperties } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { site } from '../config/site'
import { getProject, projects, type Screen } from '../data/projects'
import { usePagePointer, usePauseOffscreen, useRichMotion } from '../motion/hooks'
import { Magnetic } from '../motion/Magnetic'
import { SplitText } from '../motion/SplitText'
import { dur, ease, heroTimeline as t, spring } from '../motion/tokens'
import { Icon } from './Icon'
import { PhoneMockup } from './PhoneMockup'
import './Hero.css'

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: dur.reveal, ease: ease.out, delay },
})

export function Hero() {
  const quran = getProject('quran')!
  const zentime = getProject('zentime')!
  const omnifile = getProject('omnifile')!

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const pauseRef = usePauseOffscreen<HTMLDivElement>()
  const rich = useRichMotion()
  const reduced = useReducedMotion()

  // Page-wide cursor (shared tracker): the hero reacts wherever the pointer is,
  // not only over the phones. Desktop only; touch and reduced motion get zeros.
  const pointer = usePagePointer(rich)

  // Scroll parallax: layers drift at different speeds as the hero leaves.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  // Scroll parallax runs on desktop; touch devices get the static composition.
  const parallax = rich && !reduced
  const copyY = useTransform(scrollYProgress, [0, 1], [0, parallax ? -60 : 0])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, parallax ? 0.2 : 1])

  return (
    <section id="top" ref={sectionRef} className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid" ref={pauseRef}>
        <m.div className="hero__copy" style={{ y: copyY, opacity: copyOpacity }}>
          <m.p className="hero__status" {...rise(t.status)}>
            <span className="hero__pulse" aria-hidden="true" />
            <span className="mono hero__status-text">
              ~/projects <span className="hero__prompt">$</span> {projects.length} Android apps in development
            </span>
          </m.p>

          <SplitText
            as="h1"
            id="hero-title"
            className="hero__title"
            trigger="mount"
            delay={t.headline}
            stagger={0.07}
            parts={['I build Android apps that solve ', { text: 'real problems.', className: 'serif hero__em' }]}
          />

          <m.p className="hero__lede" {...rise(t.lede)}>
            I’m {site.name}. I design and build practical mobile apps — from file viewers to digital-wellbeing tools — working
            close to the platform, refining the details that make an app feel right, and using AI-assisted tools to move
            faster without losing understanding of the code.
          </m.p>

          <m.div className="hero__actions" {...rise(t.actions)}>
            <Magnetic>
              <a href="#projects" className="btn btn-primary">
                View projects
                <Icon name="arrowDown" size={16} />
              </a>
            </Magnetic>
            {site.links.github ? (
              <a href={site.links.github} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                <Icon name="github" size={16} />
                GitHub
                <Icon name="arrowUpRight" size={14} />
              </a>
            ) : (
              <a href="#contact" className="btn btn-ghost">
                Get in touch
                <Icon name="arrowRight" size={14} />
              </a>
            )}
          </m.div>

          <m.ol
            className="hero__index"
            aria-label="Projects"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: t.index } } }}
          >
            <m.span
              className="hero__index-rule"
              aria-hidden="true"
              variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { duration: dur.long, ease: ease.expo } } }}
            />
            {projects.map((p) => (
              <m.li
                key={p.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: dur.standard, ease: ease.out } },
                }}
              >
                <a href={`#project-${p.id}`} style={{ '--accent-p': p.accent } as CSSProperties}>
                  <span className="mono">{p.index}</span>
                  {p.name}
                </a>
              </m.li>
            ))}
          </m.ol>
        </m.div>

        <div className="hero__stage" ref={stageRef} aria-label="App showcase" role="group">
          <HeroDecor pointer={pointer} />
          <DeviceLayer
            screen={zentime.screens[0]}
            pose="left"
            depth={0.6}
            delay={t.devices + 0.2}
            pointer={pointer}
            scroll={scrollYProgress}
            parallax={parallax}
          />
          <DeviceLayer
            screen={omnifile.screens[0]}
            pose="right"
            depth={0.6}
            delay={t.devices + 0.3}
            pointer={pointer}
            scroll={scrollYProgress}
            parallax={parallax}
          />
          <DeviceLayer
            screen={quran.screens[0]}
            pose="center"
            depth={1}
            delay={t.devices}
            pointer={pointer}
            scroll={scrollYProgress}
            parallax={parallax}
            eager
          />
          <m.p
            className="hero__caption mono"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: dur.reveal }}
          >
            <span>quran-companion</span> · real build
          </m.p>
        </div>
      </div>
    </section>
  )
}

interface LayerProps {
  screen: Screen
  pose: 'left' | 'center' | 'right'
  /** 0…1 — nearer layers move more with the pointer and less with scroll. */
  depth: number
  delay: number
  pointer: { x: MotionValue<number>; y: MotionValue<number> }
  scroll: MotionValue<number>
  parallax: boolean
  eager?: boolean
}

const entrance = {
  left: { x: -60, y: 140, rotateZ: -14, rotateX: 30 },
  center: { x: 0, y: 160, rotateZ: 0, rotateX: 34 },
  right: { x: 60, y: 140, rotateZ: 14, rotateX: 30 },
}

/**
 * Each device = outer layer (pointer + scroll parallax) wrapping an inner
 * layer (spring entrance). The resting pose lives in CSS `translate`/`rotate`,
 * which compose with Motion's transforms instead of fighting them.
 */
function DeviceLayer({ screen, pose, depth, delay, pointer, scroll, parallax, eager }: LayerProps) {
  const reduced = useReducedMotion()
  const px = useTransform(pointer.x, (v) => v * 36 * depth)
  const py = useTransform(pointer.y, (v) => v * 24 * depth)
  const rotateY = useTransform(pointer.x, (v) => v * 14 * depth)
  const rotateX = useTransform(pointer.y, (v) => v * -10 * depth)
  const scrollY = useTransform(scroll, [0, 1], [0, parallax ? (1.4 - depth) * -220 : 0])
  const y = useTransform([py, scrollY], ([a, b]: number[]) => a + b)

  return (
    <m.div
      className={`hero__layer hero__layer--${pose}`}
      style={{ x: px, y, rotateX, rotateY }}
    >
      <m.div
        className="hero__device"
        initial={reduced ? { opacity: 0 } : { opacity: 0, ...entrance[pose] }}
        animate={{ opacity: 1, x: 0, y: 0, rotateZ: 0, rotateX: 0 }}
        transition={{ ...spring.device, delay, opacity: { duration: 0.4, delay } }}
      >
        <PhoneMockup screen={screen} className={`hero__phone hero__phone--${pose}`} eager={eager} />
      </m.div>
    </m.div>
  )
}

/** Technical annotations: drawn SVG guide lines with labels (desktop only). */
function HeroDecor({ pointer }: { pointer: { x: MotionValue<number>; y: MotionValue<number> } }) {
  // Depth: light leans toward the cursor, rings drift away from it, labels move most.
  const glowX = useTransform(pointer.x, (v) => v * 90)
  const glowY = useTransform(pointer.y, (v) => v * 60)
  const ringX = useTransform(pointer.x, (v) => v * -18)
  const ringY = useTransform(pointer.y, (v) => v * -12)
  const tagX = useTransform(pointer.x, (v) => v * 34)
  const tagY = useTransform(pointer.y, (v) => v * 22)
  const draw = (delay: number) => ({
    initial: { pathLength: 0, opacity: 0 },
    animate: { pathLength: 1, opacity: 1 },
    transition: { pathLength: { duration: 1.1, ease: ease.inOut, delay }, opacity: { duration: 0.2, delay } },
  })
  const label = (delay: number) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: dur.standard, ease: ease.out, delay },
  })

  return (
    <div className="hero__decor" aria-hidden="true">
      <m.div className="hero__glow" style={{ x: glowX, y: glowY }} />
      <m.div className="hero__rings-wrap" style={{ x: ringX, y: ringY }}>
      <svg className="hero__rings" viewBox="0 0 600 600" fill="none">
        <m.circle cx="300" cy="300" r="250" stroke="var(--line-strong)" strokeDasharray="2 6" {...draw(0.4)} />
        <m.circle cx="300" cy="300" r="190" stroke="var(--line)" {...draw(0.6)} />
        <m.path d="M300 20 V70 M300 530 V580 M20 300 H70 M530 300 H580" stroke="var(--accent-line)" {...draw(0.9)} />
      </svg>
      </m.div>
      <m.div className="hero__fore" style={{ x: tagX, y: tagY }}>
      <svg className="hero__callouts" viewBox="0 0 600 600" fill="none" preserveAspectRatio="none">
        <m.path d="M150 170 L95 120 H20" stroke="var(--line-strong)" {...draw(1.5)} />
        <m.path d="M455 175 L505 125 H585" stroke="var(--line-strong)" {...draw(1.6)} />
      </svg>
      <m.span className="hero__tag hero__tag--left mono" {...label(2.1)}>
        <i style={{ background: '#2EC4B0' }} />
        zentime · UsageStats
      </m.span>
      <m.span className="hero__tag hero__tag--right mono" {...label(2.2)}>
        <i style={{ background: '#5B9BF0' }} />
        omnifile · PdfRenderer
      </m.span>
      </m.div>
    </div>
  )
}
