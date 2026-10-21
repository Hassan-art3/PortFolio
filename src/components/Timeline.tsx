import { useRef, type CSSProperties } from 'react'
import { m, useScroll, useSpring } from 'motion/react'
import { getProject } from '../data/projects'
import { timeline } from '../data/timeline'
import { usePauseOffscreen } from '../motion/hooks'
import { SplitText } from '../motion/SplitText'
import { Reveal } from './Reveal'
import './Timeline.css'

export function Timeline() {
  const bodyRef = useRef<HTMLOListElement>(null)
  const termRef = usePauseOffscreen<HTMLDivElement>()

  // The connecting line fills as the terminal scrolls through the viewport.
  const { scrollYProgress } = useScroll({ target: bodyRef, offset: ['start 75%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <div className="container journey__grid">
        <div className="section-head journey__head">
          <Reveal>
            <p className="eyebrow">
              <b>03</b> / Engineering journey
            </p>
          </Reveal>
          <SplitText
            id="journey-title"
            className="section-title"
            parts={['One project, ', { text: 'then the next.', className: 'serif' }]}
          />
          <Reveal delay={150}>
            <p className="section-lede">
              Each app pushed into a different corner of Android — system APIs, file formats, media and cross-platform
              builds. Shown in order, step by step.
            </p>
          </Reveal>
        </div>

        <Reveal className="term" variant="scale" delay={100}>
          <div ref={termRef}>
            <div className="term__bar" aria-hidden="true">
              <span className="term__dots">
                <i />
                <i />
                <i />
              </span>
              <span className="term__title mono">journey.sh — bash</span>
            </div>

            <ol className="term__body" ref={bodyRef}>
              <li className="term__track" aria-hidden="true">
                <m.span className="term__fill" style={{ scaleY: fill }} />
              </li>
              {timeline.map((entry, i) => {
                const project = entry.projectId ? getProject(entry.projectId) : undefined
                const style = { '--accent-p': project?.accent ?? 'var(--accent)', '--chars': entry.command.length } as CSSProperties
                return (
                  <Reveal as="li" key={entry.id} className="term__entry" variant="left" delay={i * 60}>
                    <div style={style} className="term__entry-inner">
                      <p className="term__cmd mono">
                        <span className="term__prompt">$</span> <span className="term__typed">{entry.command}</span>
                        <span className="term__step">{entry.date ?? `step ${String(i + 1).padStart(2, '0')}`}</span>
                      </p>
                      <div className="term__out">
                        <h3 className="term__heading">
                          {project && !project.placeholder ? (
                            <a href={`#case-${project.id}`}>{entry.title}</a>
                          ) : (
                            entry.title
                          )}
                        </h3>
                        <p>{entry.body}</p>
                        {entry.aside && <p className="term__aside mono">{entry.aside}</p>}
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </ol>
            <p className="term__cursor mono" aria-hidden="true">
              <span className="term__prompt">$</span> <span className="term__caret" />
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
