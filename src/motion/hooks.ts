import { useEffect, useRef, useState, type RefObject } from 'react'
import { useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { pointer } from '../pointer/pointer'
import { spring } from './tokens'

/** True on devices with a precise pointer that can hover (i.e. desktop mice/trackpads). */
export function useFinePointer(): boolean {
  const [fine, setFine] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(hover: hover) and (pointer: fine)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const onChange = () => setFine(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return fine
}

/** Rich pointer effects run only with a fine pointer and no reduced-motion preference. */
export function useRichMotion(): boolean {
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  return fine && !reduced
}

/**
 * Normalised pointer position over an element, in the range -0.5…0.5,
 * smoothed with a spring. Writes to motion values only — never re-renders.
 */
export function usePointerParallax(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, spring.follow)
  const y = useSpring(rawY, spring.follow)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let rect: DOMRect | null = null
    const measure = () => {
      rect = el.getBoundingClientRect()
    }
    const onEnter = () => measure()
    const onMove = (e: PointerEvent) => {
      if (!rect) measure()
      const r = rect!
      rawX.set((e.clientX - r.left) / r.width - 0.5)
      rawY.set((e.clientY - r.top) / r.height - 0.5)
    }
    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
      rect = null
    }
    // Rect is cached per hover; scroll/resize invalidate it.
    const invalidate = () => {
      rect = null
    }
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)
    return () => {
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
    }
  }, [ref, enabled, rawX, rawY])

  return { x, y } as { x: MotionValue<number>; y: MotionValue<number> }
}

/**
 * Pointer-following spotlight: writes --mx/--my (px) as CSS variables,
 * batched to one write per animation frame. No React state involved.
 */
export function useSpotlight(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    let frame = 0
    let px = 0
    let py = 0
    let rect: DOMRect | null = null
    let w = 1
    let h = 1
    const write = () => {
      frame = 0
      el.style.setProperty('--mx', `${px}px`)
      el.style.setProperty('--my', `${py}px`)
      // Normalised -0.5…0.5 for CSS-only parallax (e.g. screenshots inside phones)
      el.style.setProperty('--nx', (px / w - 0.5).toFixed(3))
      el.style.setProperty('--ny', (py / h - 0.5).toFixed(3))
    }
    const onMove = (e: PointerEvent) => {
      if (!rect) {
        rect = el.getBoundingClientRect()
        w = rect.width || 1
        h = rect.height || 1
      }
      px = e.clientX - rect.left
      py = e.clientY - rect.top
      if (!frame) frame = requestAnimationFrame(write)
    }
    const invalidate = () => {
      rect = null
    }
    const onLeave = () => {
      rect = null
      cancelAnimationFrame(frame)
      frame = 0
      el.style.setProperty('--nx', '0')
      el.style.setProperty('--ny', '0')
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', invalidate, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', invalidate)
    }
  }, [ref, enabled])
}

/**
 * Adds `is-offscreen` while an element is out of view so CSS can pause
 * its infinite animations (pulse, caret, gradient) instead of running them forever.
 */
export function usePauseOffscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([entry]) => {
      el.classList.toggle('is-offscreen', !entry.isIntersecting)
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

/**
 * Page-wide pointer position from the shared tracker, as springs in the
 * -0.5…0.5 range (same scale as usePointerParallax). Static zeros when rich
 * motion is unavailable (touch, reduced motion).
 */
export function usePagePointer(enabled: boolean) {
  useEffect(() => {
    pointer.start()
  }, [])
  const zero = useMotionValue(0)
  const sx = useSpring(enabled ? pointer.mx : zero, spring.follow)
  const sy = useSpring(enabled ? pointer.my : zero, spring.follow)
  // Tracker values are -1…1; halve so existing depth factors keep their meaning.
  const x = useTransform(sx, (v) => v * 0.5)
  const y = useTransform(sy, (v) => v * 0.5)
  return { x, y } as { x: MotionValue<number>; y: MotionValue<number> }
}
