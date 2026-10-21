import { m, useMotionValue, useSpring } from 'motion/react'
import { useRef, type PointerEvent, type ReactNode } from 'react'
import { useRichMotion } from './hooks'
import { spring } from './tokens'

interface Props {
  children: ReactNode
  /** Max pull in px. */
  strength?: number
  className?: string
}

/**
 * Gently pulls its child toward the pointer (desktop only) and springs back.
 * Pointer moves write motion values; nothing re-renders.
 */
export function Magnetic({ children, strength = 8, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const rich = useRichMotion()
  const x = useSpring(useMotionValue(0), spring.follow)
  const y = useSpring(useMotionValue(0), spring.follow)

  const onMove = (e: PointerEvent) => {
    if (!rich || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set(((e.clientX - r.left) / r.width - 0.5) * strength * 2)
    y.set(((e.clientY - r.top) / r.height - 0.5) * strength * 2)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <m.span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </m.span>
  )
}
