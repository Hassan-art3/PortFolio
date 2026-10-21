/**
 * Motion system — one place for timing, easing and springs.
 *
 *   micro     120–220 ms  hovers, presses, toggles
 *   standard  200–400 ms  tabs, menus, filters
 *   reveal    350–700 ms  scroll reveals, hero choreography
 *
 * CSS mirrors these in index.css (--dur-*, --ease-*).
 */
import type { Transition } from 'motion/react'

export const ease = {
  /** Fast start, long settle — default for reveals. */
  out: [0.22, 1, 0.36, 1] as const,
  /** Snappy in-out for things that move across the screen. */
  inOut: [0.65, 0, 0.35, 1] as const,
  /** Expo-style for masked text reveals. */
  expo: [0.16, 1, 0.3, 1] as const,
}

export const dur = {
  micro: 0.16,
  standard: 0.3,
  reveal: 0.6,
  long: 0.9,
}

export const spring = {
  /** Buttons, chips — quick with a touch of bounce. */
  press: { type: 'spring', stiffness: 520, damping: 30, mass: 0.6 } satisfies Transition,
  /** Sliding indicators (nav, tabs, filters). */
  indicator: { type: 'spring', stiffness: 420, damping: 36 } satisfies Transition,
  /** Device mockups landing into place. */
  device: { type: 'spring', stiffness: 120, damping: 18, mass: 1 } satisfies Transition,
  /** Pointer-driven tilt/parallax smoothing. */
  follow: { stiffness: 160, damping: 22, mass: 0.5 },
}

/** Hero choreography — seconds from first paint. */
export const heroTimeline = {
  nav: 0,
  status: 0.05,
  headline: 0.1,
  lede: 0.45,
  actions: 0.55,
  index: 0.65,
  devices: 0.2,
}

/**
 * Shared whileInView settings. The huge top margin counts anything already
 * scrolled past as "seen", so a fast fling can't skip an entrance and leave
 * content invisible.
 */
export const inView = { once: true, margin: '99999px 0px -10% 0px' } as const
export const inViewSoon = { once: true, margin: '99999px 0px -4% 0px' } as const
