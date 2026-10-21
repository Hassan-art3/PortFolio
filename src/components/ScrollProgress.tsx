import { m, useScroll, useSpring } from 'motion/react'

/** Thin reading-progress bar; animates scaleX only. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })
  return <m.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />
}
