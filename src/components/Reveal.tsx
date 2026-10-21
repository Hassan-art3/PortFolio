import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties } from 'react'

/** One shared observer for every revealed element on the page. */
let observer: IntersectionObserver | null = null

function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      }
    },
    // Huge top margin: anything already scrolled past counts as seen, so fast
    // scrolling can never skip a reveal and leave content hidden.
    { rootMargin: '99999px 0px -8% 0px', threshold: 0 },
  )
  return observer
}

interface RevealProps {
  as?: ElementType
  children: ReactNode
  className?: string
  /** Stagger delay in ms. */
  delay?: number
  id?: string
  /** Entrance style. Defaults to a short rise. */
  variant?: 'up' | 'left' | 'right' | 'scale' | 'clip'
}

export function Reveal({ as: Tag = 'div', children, className = '', delay = 0, id, variant = 'up' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    const obs = getObserver()
    if (!el) return
    if (!obs) {
      el.classList.add('is-visible')
      return
    }
    obs.observe(el)
    return () => obs.unobserve(el)
  }, [])

  const style = delay ? ({ '--reveal-delay': `${delay}ms` } as CSSProperties) : undefined

  return (
    <Tag ref={ref} id={id} className={`reveal ${className}`.trim()} data-reveal={variant} style={style}>
      {children}
    </Tag>
  )
}
