import { m, type Variants } from 'motion/react'
import { dur, ease, inView } from './tokens'
import './SplitText.css'

export type TextPart = string | { text: string; className?: string }

interface Props {
  as?: keyof typeof tags
  parts: TextPart[]
  id?: string
  className?: string
  /** 'mount' plays immediately (hero); 'view' plays once when scrolled into view. */
  trigger?: 'mount' | 'view'
  delay?: number
  /** Seconds between words. */
  stagger?: number
}

const tags = { h1: m.h1, h2: m.h2, h3: m.h3, p: m.p }

const word: Variants = {
  hidden: { y: '115%', rotate: 4 },
  visible: { y: '0%', rotate: 0, transition: { duration: dur.long, ease: ease.expo } },
}

/**
 * Masked word-by-word reveal for large headings.
 * Screen readers get the plain sentence once; the animated words are aria-hidden.
 */
export function SplitText({ as = 'h2', parts, id, className = '', trigger = 'view', delay = 0, stagger = 0.06 }: Props) {
  const Tag = tags[as]
  const plain = parts.map((p) => (typeof p === 'string' ? p : p.text)).join('')

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  }

  const triggerProps =
    trigger === 'mount'
      ? { initial: 'hidden', animate: 'visible' }
      : { initial: 'hidden', whileInView: 'visible', viewport: inView }

  return (
    <Tag id={id} className={`split ${className}`.trim()} variants={container} {...triggerProps}>
      <span className="visually-hidden">{plain}</span>
      <span aria-hidden="true">
        {parts.map((part, pi) => {
          const text = typeof part === 'string' ? part : part.text
          const cls = typeof part === 'string' ? undefined : part.className
          const words = text.split(/(\s+)/)
          return (
            <span key={pi} className={cls}>
              {words.map((w, wi) =>
                /^\s+$/.test(w) || w === '' ? (
                  w
                ) : (
                  <span key={wi} className="split__mask">
                    <m.span className="split__word" variants={word}>
                      {w}
                    </m.span>
                  </span>
                ),
              )}
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
