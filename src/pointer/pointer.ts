import { motionValue } from 'motion/react'

/**
 * Shared pointer tracker — the single source of cursor data for the page.
 *
 * - One passive `pointermove` listener on window; no React state, ever.
 * - Plain fields for the canvas renderer to read inside its own rAF loop.
 * - Motion values for components (Motion batches their updates per frame).
 * - Only active on devices with a fine, hover-capable pointer and when the
 *   user hasn't asked for reduced motion. Touch devices get nothing.
 */
class PointerTracker {
  /** Viewport pixels. */
  x = 0
  y = 0
  /** Normalised to -1…1 across the viewport (0 = centre). */
  nx = 0
  ny = 0
  /** True while the pointer is over the page window. */
  inside = false
  /** Recent movement speed in px/ms (decays when still). */
  speed = 0
  /** performance.now() of the last move. */
  lastMove = 0
  enabled = false

  /** Normalised coordinates as motion values for Motion components. */
  readonly mx = motionValue(0)
  readonly my = motionValue(0)
  /** 0 or 1 — whether the pointer is in the window (components fade with this). */
  readonly presence = motionValue(0)

  private started = false
  private lastT = 0

  start() {
    if (this.started || typeof window === 'undefined') return
    this.started = true
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const evaluate = () => {
      const was = this.enabled
      this.enabled = fine.matches && !reduced.matches
      if (was && !this.enabled) this.leave()
    }
    evaluate()
    fine.addEventListener('change', evaluate)
    reduced.addEventListener('change', evaluate)

    window.addEventListener('pointermove', this.onMove, { passive: true })
    // Leaving the window: `pointerout` on the document with no related target
    document.addEventListener('pointerout', this.onOut, { passive: true })
    window.addEventListener('blur', this.leave)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.leave()
    })
  }

  private onMove = (e: PointerEvent) => {
    if (!this.enabled || e.pointerType === 'touch') return
    const now = e.timeStamp || performance.now()
    const dx = e.clientX - this.x
    const dy = e.clientY - this.y
    const dt = Math.max(1, now - this.lastT)
    this.lastT = now
    // Exponential average of speed; first move after re-entry doesn't count as a jump.
    const inst = this.inside ? Math.hypot(dx, dy) / dt : 0
    this.speed += (Math.min(inst, 4) - this.speed) * 0.25
    this.x = e.clientX
    this.y = e.clientY
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    this.nx = (e.clientX / w) * 2 - 1
    this.ny = (e.clientY / h) * 2 - 1
    this.lastMove = now
    this.mx.set(this.nx)
    this.my.set(this.ny)
    if (!this.inside) {
      this.inside = true
      this.presence.set(1)
    }
  }

  private onOut = (e: PointerEvent) => {
    if (!e.relatedTarget) this.leave()
  }

  /** Pointer left the window, the window lost focus, or the tab was hidden: ease everything home. */
  leave = () => {
    if (!this.inside) return
    this.inside = false
    this.speed = 0
    this.nx = 0
    this.ny = 0
    this.presence.set(0)
    this.mx.set(0)
    this.my.set(0)
  }
}

export const pointer = new PointerTracker()
