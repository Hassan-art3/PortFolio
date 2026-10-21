import { useRef, type CSSProperties } from 'react'
import { m, useReducedMotion, useScroll, useTransform, type MotionValue, type Variants } from 'motion/react'
import { projects, type Project, type Screen } from '../data/projects'
import { usePointerParallax, useRichMotion, useSpotlight } from '../motion/hooks'
import { SplitText } from '../motion/SplitText'
import { dur, ease, inView, inViewSoon } from '../motion/tokens'
import { Icon } from './Icon'
import { PhoneMockup } from './PhoneMockup'
import { ProjectIcon } from './ProjectIcon'
import { Reveal } from './Reveal'
import './Projects.css'

export function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">
              <b>01</b> / Selected work
            </p>
          </Reveal>
          <SplitText
            id="projects-title"
            className="section-title"
            parts={['Four apps, each built around ', { text: 'one clear job.', className: 'serif' }]}
          />
          <Reveal delay={150}>
            <p className="section-lede">
              Real projects at different stages of development. Every technology listed below comes straight from the
              project’s source code.
            </p>
          </Reveal>
        </div>

        <div className="projects__list">
          {projects.map((p, i) => (
            <ProjectShowcase key={p.id} project={p} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

const infoList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const infoItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: dur.reveal, ease: ease.out } },
}
const tagList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
}
const tagItem: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500, damping: 28 } },
}

function ProjectShowcase({ project, flip }: { project: Project; flip: boolean }) {
  const articleRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const rich = useRichMotion()
  const reduced = useReducedMotion()

  useSpotlight(innerRef, rich)
  const pointer = usePointerParallax(innerRef, rich)

  // Phones drift upward as the card scrolls through the viewport (desktop only:
  // on touch devices the per-frame work isn't worth it on a small screen).
  const { scrollYProgress } = useScroll({ target: articleRef, offset: ['start end', 'end start'] })
  const drift = useTransform(scrollYProgress, [0, 1], reduced || !rich ? [0, 0] : [70, -70])

  // Card depth (desktop only; the springs stay at 0 on touch / reduced motion):
  // the whole card tilts a few degrees toward the cursor, the copy shifts
  // slightly against it and the halo drifts further, so the layers separate.
  const tiltX = useTransform(pointer.y, (v) => v * -3)
  const tiltY = useTransform(pointer.x, (v) => v * 4)
  const infoX = useTransform(pointer.x, (v) => v * -10)
  const infoY = useTransform(pointer.y, (v) => v * -6)
  const haloX = useTransform(pointer.x, (v) => v * -40)
  const haloY = useTransform(pointer.y, (v) => v * -30)

  const style = { '--accent-p': project.accent } as CSSProperties
  const screens = project.screens.slice(0, 3)
  const multi = screens.length > 1

  return (
    <m.article
      ref={articleRef}
      id={`project-${project.id}`}
      className={`showcase ${flip ? 'showcase--flip' : ''} ${project.placeholder ? 'showcase--placeholder' : ''}`}
      initial={{ opacity: 0, y: 60, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={inView}
      transition={{ duration: dur.long, ease: ease.expo }}
      style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1400 }}
    >
      <div className="showcase__inner" ref={innerRef} style={style}>
        <span className="showcase__spot" aria-hidden="true" />
        <span className="showcase__ring" aria-hidden="true" />

        <m.div
          className="showcase__info"
          style={{ x: infoX, y: infoY }}
          variants={infoList}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
        >
          <m.div className="showcase__meta" variants={infoItem}>
            <span className="showcase__index mono">{project.index}</span>
            <span className="showcase__stage mono">
              <span aria-hidden="true" />
              {project.stage}
            </span>
          </m.div>

          <m.div className="showcase__title-row" variants={infoItem}>
            <m.span
              className="showcase__icon"
              variants={{
                hidden: { scale: 0.4, rotate: -20, opacity: 0 },
                visible: { scale: 1, rotate: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 16 } },
              }}
            >
              <ProjectIcon project={project} size={56} />
            </m.span>
            <h3 className="showcase__name">{project.name}</h3>
          </m.div>

          <m.p className="showcase__tagline" variants={infoItem}>
            {project.tagline}
          </m.p>

          {project.tags.length > 0 && (
            <m.ul className="showcase__tags" aria-label="Technologies" variants={tagList}>
              {project.tags.map((t) => (
                <m.li key={t} className="tag" variants={tagItem}>
                  {t}
                </m.li>
              ))}
            </m.ul>
          )}

          <m.div className="showcase__links" variants={infoItem}>
            {!project.placeholder && (
              <a href={`#case-${project.id}`} className="showcase__cta">
                <span>Read the case study</span>
                <span className="showcase__cta-icon" aria-hidden="true">
                  <Icon name="arrowRight" size={16} />
                  <Icon name="arrowRight" size={16} />
                </span>
              </a>
            )}
            {project.links.map((l) => (
              <a key={l.href} href={l.href} className="text-link" target="_blank" rel="noopener noreferrer">
                {l.label}
                <Icon name="arrowUpRight" size={14} />
              </a>
            ))}
          </m.div>
        </m.div>

        <m.div
          className={`showcase__visual ${multi ? 'showcase__visual--multi' : ''}`}
          initial={{ clipPath: reduced ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)' }}
          whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
          viewport={inView}
          transition={{ duration: 1.1, ease: ease.expo, delay: 0.1 }}
        >
          <m.div className="showcase__halo" aria-hidden="true" style={{ x: haloX, y: haloY }} />
          {screens.map((s, i) => (
            <ShowcasePhone key={i} screen={s} index={i} multi={multi} pointer={pointer} drift={drift} />
          ))}
        </m.div>
      </div>
    </m.article>
  )
}

interface PhoneProps {
  screen: Screen
  index: number
  multi: boolean
  pointer: { x: MotionValue<number>; y: MotionValue<number> }
  drift: MotionValue<number>
}

/** Outer layer: pointer tilt + scroll drift. Resting pose is CSS translate/rotate on the phone. */
function ShowcasePhone({ screen, index, multi, pointer, drift }: PhoneProps) {
  // Front phone moves most; back phones less, for depth.
  const depth = index === 0 ? 1 : 0.55
  const x = useTransform(pointer.x, (v) => v * 30 * depth)
  const py = useTransform(pointer.y, (v) => v * 20 * depth)
  const rotateY = useTransform(pointer.x, (v) => v * 16 * depth)
  const rotateX = useTransform(pointer.y, (v) => v * -12 * depth)
  const y = useTransform([py, drift], ([a, b]: number[]) => a + b * depth)

  return (
    <m.div
      className={`showcase__layer showcase__layer--${index}`}
      style={{ x, y, rotateX, rotateY }}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={inViewSoon}
      transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.35 + index * 0.12 }}
    >
      <PhoneMockup screen={screen} className={`showcase__phone showcase__phone--${index} ${multi ? 'is-multi' : ''}`} />
    </m.div>
  )
}
