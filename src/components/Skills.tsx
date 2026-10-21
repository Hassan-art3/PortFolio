import { useState, type CSSProperties } from 'react'
import { projects } from '../data/projects'
import { skillGroups } from '../data/skills'
import { m } from 'motion/react'
import { SplitText } from '../motion/SplitText'
import { spring } from '../motion/tokens'
import { Reveal } from './Reveal'
import './Skills.css'

/** Only projects that actually have skills attached appear in the filter. */
const filterable = projects.filter((p) => skillGroups.some((g) => g.items.some((i) => i.usedIn.includes(p.id))))

export function Skills() {
  const [focus, setFocus] = useState<string | null>(null)

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="container">
        <div className="section-head">
          <Reveal>
            <p className="eyebrow">
              <b>04</b> / Skills &amp; tools
            </p>
          </Reveal>
          <SplitText
            id="skills-title"
            className="section-title"
            parts={['The stack, ', { text: 'traced to real code.', className: 'serif' }]}
          />
          <Reveal delay={150}>
            <p className="section-lede">
              Every item below appears in at least one of my projects. Pick a project to see what it uses.
            </p>
          </Reveal>
        </div>

        <Reveal className="skills__filter" delay={60}>
          <span className="mono skills__filter-label" id="skills-filter-label">
            filter --project
          </span>
          <div role="group" aria-labelledby="skills-filter-label" className="skills__chips">
            <button
              type="button"
              className="skills__chip"
              aria-pressed={focus === null}
              onClick={() => setFocus(null)}
            >
              {focus === null && <m.span className="skills__chip-bg" layoutId="skills-chip" transition={spring.indicator} />}
              <span className="skills__chip-label">All</span>
            </button>
            {filterable.map((p) => (
              <button
                key={p.id}
                type="button"
                className="skills__chip"
                aria-pressed={focus === p.id}
                style={{ '--accent-p': p.accent } as CSSProperties}
                onClick={() => setFocus(focus === p.id ? null : p.id)}
              >
                {focus === p.id && (
                  <m.span className="skills__chip-bg" layoutId="skills-chip" transition={spring.indicator} />
                )}
                <span className="skills__chip-label">
                  <span className="skills__dot" aria-hidden="true" />
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="skills__grid">
          {skillGroups.map((group, gi) => (
            <Reveal key={group.id} className="skills__group" variant="scale" delay={gi * 70}>
              <p className="skills__comment mono">// {group.comment}</p>
              <h3 className="skills__group-title">{group.label}</h3>
              <ul className="skills__items">
                {group.items.map((item, ii) => {
                  const dim = focus !== null && !item.usedIn.includes(focus)
                  const usedNames = item.usedIn.map((id) => projects.find((p) => p.id === id)?.name).filter(Boolean)
                  return (
                    <li
                      key={item.name}
                      className={`skills__item ${dim ? 'is-dim' : ''}`}
                      style={{ '--i': ii, '--g': gi } as CSSProperties}
                    >
                      <span className="skills__name">
                        {item.name}
                        {item.note && <span className="skills__note">{item.note}</span>}
                      </span>
                      <span className="skills__used" aria-label={`Used in ${usedNames.join(', ')}`}>
                        {item.usedIn.map((id) => {
                          const p = projects.find((x) => x.id === id)
                          return (
                            <span
                              key={id}
                              className="skills__dot"
                              title={p?.name}
                              style={{ '--accent-p': p?.accent } as CSSProperties}
                            />
                          )
                        })}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
