import { atmospheres, backgroundConfig, glowFields, type GlowId, type RGB } from './config'

/**
 * Scroll-progress tracking for the background.
 *
 * Nothing runs inside scroll events: the renderer calls `sample()` once per
 * animation frame, which reads `window.scrollY` (no forced layout) and blends
 * the section atmospheres into a preallocated state object.
 * Section positions are measured only on resize / content size changes.
 */

export interface BlendedState {
  glows: Record<GlowId, { x: number; y: number; o: number }>
  tint: RGB
  particles: number
  lines: number
  grid: number
}

const makeState = (): BlendedState => ({
  glows: Object.fromEntries(glowFields.map((g) => [g.id, { x: 50, y: 50, o: 0 }])) as BlendedState['glows'],
  tint: [200, 245, 60],
  particles: 1,
  lines: 1,
  grid: 1,
})

const smoothstep = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export class ScrollTracker {
  /** Current scroll position (px). */
  y = 0
  /** Smoothed scroll velocity (px per frame at 60fps, signed: + = down). */
  velocity = 0
  /** 0–1 progress through the whole page. */
  progress = 0
  /** Blend target from section positions… */
  readonly target: BlendedState = makeState()
  /** …and the eased state the renderer actually draws. */
  readonly current: BlendedState = makeState()

  private anchors: number[] = []
  private maxScroll = 1
  private lastY = 0
  private resizeObs: ResizeObserver | null = null
  private dirty = true

  start() {
    this.y = this.lastY = window.scrollY
    // Re-measure lazily when page content or viewport size changes.
    this.resizeObs = new ResizeObserver(() => {
      this.dirty = true
    })
    this.resizeObs.observe(document.body)
    window.addEventListener('resize', this.markDirty, { passive: true })
    this.measure()
    this.sample(1, true)
  }

  stop() {
    this.resizeObs?.disconnect()
    window.removeEventListener('resize', this.markDirty)
  }

  private markDirty = () => {
    this.dirty = true
  }

  /** Section midpoints in document coordinates. Runs only when layout changed. */
  private measure() {
    this.dirty = false
    const sy = window.scrollY
    this.anchors = atmospheres.map((a) => {
      const el = document.getElementById(a.section)
      if (!el) return Number.NaN
      const r = el.getBoundingClientRect()
      return r.top + sy + Math.min(r.height, window.innerHeight * 1.2) / 2
    })
    this.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  }

  /**
   * Update position, velocity and section blend.
   * @param dt frame time scaled to 60fps (1 = 16.7ms)
   * @param snap jump straight to the target (first frame, reduced motion)
   */
  sample(dt: number, snap = false) {
    if (this.dirty) this.measure()
    const y = window.scrollY
    const rawVel = (y - this.lastY) / Math.max(dt, 0.25)
    this.lastY = y
    this.y = y
    const k = 1 - Math.pow(1 - backgroundConfig.motion.velocitySmoothing, dt)
    this.velocity += (rawVel - this.velocity) * k
    if (Math.abs(this.velocity) < 0.01) this.velocity = 0
    this.progress = Math.min(1, Math.max(0, y / this.maxScroll))

    this.computeTarget(y + window.innerHeight / 2)

    const e = snap ? 1 : 1 - Math.pow(1 - backgroundConfig.motion.sectionEase, dt)
    const c = this.current
    const t = this.target
    for (const g of glowFields) {
      const cg = c.glows[g.id]
      const tg = t.glows[g.id]
      cg.x = lerp(cg.x, tg.x, e)
      cg.y = lerp(cg.y, tg.y, e)
      cg.o = lerp(cg.o, tg.o, e)
    }
    for (let i = 0; i < 3; i++) c.tint[i] = lerp(c.tint[i], t.tint[i], e)
    c.particles = lerp(c.particles, t.particles, e)
    c.lines = lerp(c.lines, t.lines, e)
    c.grid = lerp(c.grid, t.grid, e)
  }

  /** Interpolate between the two atmospheres around the viewport centre. */
  private computeTarget(centre: number) {
    const a = this.anchors
    let i = 0
    while (i < a.length - 1 && !(centre < a[i + 1]) ) i++
    // Skip sections that weren't found
    let from = Math.max(0, i)
    while (from > 0 && Number.isNaN(a[from])) from--
    let to = Math.min(a.length - 1, from + 1)
    while (to < a.length - 1 && Number.isNaN(a[to])) to++

    let t = 0
    if (centre <= a[0] || Number.isNaN(a[0])) {
      from = to = 0
    } else if (centre >= a[a.length - 1]) {
      from = to = a.length - 1
    } else if (to !== from) {
      t = smoothstep(Math.min(1, Math.max(0, (centre - a[from]) / (a[to] - a[from]))))
    }

    const A = atmospheres[from]
    const B = atmospheres[to]
    const out = this.target
    for (const g of glowFields) {
      const ga = A.glows[g.id]
      const gb = B.glows[g.id]
      const o = out.glows[g.id]
      o.x = lerp(ga.x, gb.x, t)
      o.y = lerp(ga.y, gb.y, t)
      o.o = lerp(ga.o, gb.o, t)
    }
    for (let k = 0; k < 3; k++) out.tint[k] = lerp(A.tint[k], B.tint[k], t)
    out.particles = lerp(A.particles, B.particles, t)
    out.lines = lerp(A.lines, B.lines, t)
    out.grid = lerp(A.grid, B.grid, t)
  }
}
