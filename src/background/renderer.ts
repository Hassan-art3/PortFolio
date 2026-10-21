import { backgroundConfig as cfg, glowFields } from './config'
import { pointer } from '../pointer/pointer'
import { ScrollTracker } from './scrollTracker'

export interface BackgroundLayers {
  canvas: HTMLCanvasElement
  glows: HTMLElement[]
  dots: HTMLElement
  grid: HTMLElement
  cursor: HTMLElement
}

const GRID_CELL = 96
const DOT_CELL = 28
const LINK_BUCKETS = 4
const DEPTH_BUCKETS = 3
const TAU = Math.PI * 2

/**
 * Canvas + layer renderer for the page background.
 *
 * One requestAnimationFrame loop drives everything: it samples scroll once,
 * moves the CSS layers with transform/opacity, and redraws the canvas.
 * Particle data lives in typed arrays allocated only when the count changes.
 */
export class BackgroundRenderer {
  private readonly ctx: CanvasRenderingContext2D
  private readonly tracker = new ScrollTracker()
  private raf = 0
  private last = 0
  private time = 0
  private running = false
  private reduced: boolean

  // viewport
  private w = 0
  private h = 0
  private dpr = 1
  private mobile = false
  private needsResize = true

  // particles (structure of arrays)
  private count = 0
  private px = new Float32Array(0)
  private py = new Float32Array(0)
  private pz = new Float32Array(0)
  private pvx = new Float32Array(0)
  private pvy = new Float32Array(0)
  private pphase = new Float32Array(0)
  /** Cursor displacement per particle (springs back to 0). */
  private pox = new Float32Array(0)
  private poy = new Float32Array(0)
  /** 0–1 cursor proximity per particle, used for brightening. */
  private plit = new Float32Array(0)
  /** Final draw positions this frame (motion + cursor offset + pointer parallax). */
  private qx = new Float32Array(0)
  private qy = new Float32Array(0)

  // pointer state (smoothed inside the loop; raw values come from the shared tracker)
  private pnx = 0
  private pny = 0
  private gx = 0
  private gy = 0
  private gPresence = 0
  private cursorX = -9999
  private cursorY = -9999
  private lastCursorKey = ''

  // quality management
  private quality = 0 // 0 = full, 1 = fewer particles + no links, 2 = no lines
  private frameEma = 16.7
  private slowFrames = 0
  private lastScrollY = 0
  private lastActive = 0
  private skip = false

  // cached last-written layer styles, to avoid redundant style writes
  private readonly glowCache: Float32Array
  private lastGridT = Number.NaN
  private lastDotsT = Number.NaN
  private lastGridX = 0
  private lastDotsX = 0
  private lastGridO = Number.NaN

  private readonly layers: BackgroundLayers

  constructor(layers: BackgroundLayers, options: { reducedMotion: boolean }) {
    this.layers = layers
    const ctx = layers.canvas.getContext('2d', { alpha: true })
    if (!ctx) throw new Error('Canvas 2D not available')
    this.ctx = ctx
    this.reduced = options.reducedMotion && cfg.reducedMotion === 'static'
    this.glowCache = new Float32Array(glowFields.length * 3).fill(Number.NaN)
  }

  start() {
    pointer.start()
    this.tracker.start()
    this.lastScrollY = this.tracker.y
    this.resize()
    window.addEventListener('resize', this.onResize, { passive: true })
    document.addEventListener('visibilitychange', this.onVisibility)

    if (this.reduced) {
      // Static, complete frame; only the section lighting follows scroll.
      this.renderStatic()
      window.addEventListener('scroll', this.onStaticScroll, { passive: true })
      return
    }
    this.running = true
    this.last = performance.now()
    this.lastActive = this.last
    this.raf = requestAnimationFrame(this.frame)
  }

  destroy() {
    this.running = false
    cancelAnimationFrame(this.raf)
    this.tracker.stop()
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.onStaticScroll)
    document.removeEventListener('visibilitychange', this.onVisibility)
  }

  setReducedMotion(reduced: boolean) {
    const next = reduced && cfg.reducedMotion === 'static'
    if (next === this.reduced) return
    this.destroy()
    this.reduced = next
    this.start()
  }

  // ---- lifecycle helpers -------------------------------------------------

  private onResize = () => {
    this.needsResize = true
    if (this.reduced) this.renderStatic()
  }

  private onVisibility = () => {
    if (this.reduced) return
    if (document.hidden) {
      // Hidden tab: stop the loop entirely.
      cancelAnimationFrame(this.raf)
      this.running = false
    } else if (!this.running) {
      this.running = true
      this.last = performance.now()
      this.raf = requestAnimationFrame(this.frame)
    }
  }

  private staticQueued = false
  private onStaticScroll = () => {
    if (this.staticQueued) return
    this.staticQueued = true
    requestAnimationFrame(() => {
      this.staticQueued = false
      this.tracker.sample(1, true)
      this.applyLayers(false)
    })
  }

  private resize() {
    this.needsResize = false
    const vw = window.innerWidth
    const vh = window.innerHeight
    this.mobile = vw < cfg.performance.mobileBreakpoint || window.matchMedia('(pointer: coarse)').matches
    const maxDpr = this.mobile ? cfg.performance.mobile.maxDpr : cfg.performance.maxDpr
    this.dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    this.w = vw
    this.h = vh
    const c = this.layers.canvas
    c.width = Math.round(vw * this.dpr)
    c.height = Math.round(vh * this.dpr)
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    this.setParticleCount(this.targetCount())
  }

  private targetCount() {
    const p = cfg.particles
    let n = Math.round(((this.w * this.h) / 10000) * p.density)
    n = Math.max(p.min, Math.min(p.max, n))
    if (this.mobile) n = Math.min(n, cfg.performance.mobile.maxParticles)
    if (this.quality >= 1) n = Math.round(n * 0.55)
    return n
  }

  /** Resize particle arrays, keeping existing particles so resizes don't "reset" the field. */
  private setParticleCount(n: number) {
    if (n === this.count) return
    const grow = (src: Float32Array) => {
      const dst = new Float32Array(n)
      dst.set(src.subarray(0, Math.min(src.length, n)))
      return dst
    }
    const old = this.count
    this.px = grow(this.px)
    this.py = grow(this.py)
    this.pz = grow(this.pz)
    this.pvx = grow(this.pvx)
    this.pvy = grow(this.pvy)
    this.pphase = grow(this.pphase)
    this.pox = grow(this.pox)
    this.poy = grow(this.poy)
    this.plit = grow(this.plit)
    this.qx = grow(this.qx)
    this.qy = grow(this.qy)
    for (let i = old; i < n; i++) this.spawn(i, true)
    this.count = n
  }

  private spawn(i: number, anywhere: boolean) {
    this.px[i] = Math.random() * this.w
    this.py[i] = anywhere ? Math.random() * this.h : Math.random() < 0.5 ? -10 : this.h + 10
    // Depth: 0.25 (far, small, slow) … 1 (near)
    const z = 0.25 + Math.pow(Math.random(), 1.6) * 0.75
    this.pz[i] = z
    const a = Math.random() * TAU
    this.pvx[i] = Math.cos(a) * 0.6
    this.pvy[i] = Math.sin(a) * 0.35 - 0.25 // slight upward drift
    this.pphase[i] = Math.random() * TAU
  }

  // ---- frame -------------------------------------------------------------

  private frame = (now: number) => {
    if (!this.running) return
    this.raf = requestAnimationFrame(this.frame)

    const rawDt = now - this.last
    this.last = now
    const dt = Math.min(4, Math.max(0.25, rawDt / 16.667))

    // Idle: half-rate updates once the page has been still for a while.
    const scrolling = Math.abs(window.scrollY - this.lastScrollY) > 0.5 || Math.abs(this.tracker.velocity) > 0.2
    const pointerActive = pointer.inside && now - pointer.lastMove < 300
    if (scrolling || pointerActive) this.lastActive = now
    const idle = now - this.lastActive > cfg.performance.idleAfterMs
    if (idle) {
      this.skip = !this.skip
      if (this.skip) return
    }

    this.watchPerformance(rawDt, idle)
    if (this.needsResize) this.resize()

    const stepDt = idle ? dt * 2 : dt
    this.time += stepDt * 16.667
    const prevY = this.lastScrollY
    this.tracker.sample(stepDt)
    this.lastScrollY = this.tracker.y

    this.updatePointer(stepDt, now)
    this.applyLayers(true)
    this.update(stepDt, this.tracker.y - prevY)
    this.draw()
  }

  /** Steps quality down if frames are consistently slow (never during idle half-rate). */
  private watchPerformance(rawDt: number, idle: boolean) {
    if (idle || rawDt > 250) return
    this.frameEma += (rawDt - this.frameEma) * 0.05
    if (this.frameEma > cfg.performance.slowFrameMs) {
      if (++this.slowFrames > 90 && this.quality < 2) {
        this.quality++
        this.slowFrames = 0
        this.frameEma = 16.7
        this.setParticleCount(this.targetCount())
      }
    } else {
      this.slowFrames = Math.max(0, this.slowFrames - 1)
    }
  }

  /**
   * Ease toward the shared pointer: a slow follow for parallax and a weighted,
   * lagging follow for the cursor light. Runs inside the existing loop.
   */
  private updatePointer(dt: number, now: number) {
    const pc = cfg.pointer
    const active = pointer.enabled && pointer.inside
    const kp = 1 - Math.pow(1 - pc.parallaxFollow, dt)
    this.pnx += ((active ? pointer.nx : 0) - this.pnx) * kp
    this.pny += ((active ? pointer.ny : 0) - this.pny) * kp

    const kg = 1 - Math.pow(1 - pc.glow.follow, dt)
    if (active) {
      // First frame after entering: start the light at the cursor instead of sliding in from a corner.
      if (this.gPresence < 0.01) {
        this.gx = pointer.x
        this.gy = pointer.y
      }
      this.gx += (pointer.x - this.gx) * kg
      this.gy += (pointer.y - this.gy) * kg
    }
    // Speed decays once the pointer stops moving.
    const still = now - pointer.lastMove
    const speed = active ? pointer.speed * Math.max(0, 1 - still / 400) : 0
    const target = active ? Math.min(1, pc.glow.opacity + Math.min(1, speed / 1.5) * pc.glow.speedBoost) : 0
    this.gPresence += (target - this.gPresence) * (1 - Math.pow(1 - 0.08, dt))

    // Particle interaction uses the lagged light position, so pushes feel damped.
    this.cursorX = active ? this.gx : -9999
    this.cursorY = active ? this.gy : -9999

    const half = pc.glow.size / 2
    const o = this.gPresence < 0.004 ? 0 : this.gPresence
    const key = `${Math.round(this.gx)}|${Math.round(this.gy)}|${o.toFixed(3)}`
    if (key !== this.lastCursorKey) {
      this.lastCursorKey = key
      const el = this.layers.cursor
      el.style.transform = `translate3d(${(this.gx - half).toFixed(1)}px, ${(this.gy - half).toFixed(1)}px, 0)`
      el.style.opacity = o.toFixed(3)
    }
  }

  /** Move glow fields, dots and grid with transform/opacity only. */
  private applyLayers(animated: boolean) {
    const s = this.tracker.current
    const y = this.tracker.y
    const vw = this.w || window.innerWidth
    const vh = this.h || window.innerHeight
    const glowShift = animated ? -this.tracker.progress * vh * cfg.parallax.glow * 4 : 0
    const breathe = animated ? Math.sin(this.time * 0.00025) : 0

    for (let i = 0; i < glowFields.length; i++) {
      const g = glowFields[i]
      const st = s.glows[g.id]
      const half = g.size / 2
      // Glow fields drift opposite to the cursor (each a little differently, for depth)
      const pg = cfg.pointer.parallax.glows * (0.7 + (i % 3) * 0.2)
      const x = (st.x / 100) * vw - half + breathe * 18 * (i % 2 ? 1 : -1) + this.pnx * pg
      const gy = (st.y / 100) * vh - half + glowShift + breathe * 12 + this.pny * pg
      const o = Math.min(1, st.o * cfg.glow.intensity)
      const k = i * 3
      if (
        Math.abs(this.glowCache[k] - x) > 0.3 ||
        Math.abs(this.glowCache[k + 1] - gy) > 0.3 ||
        Math.abs(this.glowCache[k + 2] - o) > 0.003 ||
        Number.isNaN(this.glowCache[k])
      ) {
        this.glowCache[k] = x
        this.glowCache[k + 1] = gy
        this.glowCache[k + 2] = o
        const el = this.layers.glows[i]
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`
        el.style.opacity = o.toFixed(3)
      }
    }

    // Scroll parallax (vertical, wraps per cell) + pointer parallax (a few px), in one transform each
    const pp = cfg.pointer.parallax
    const gridT = animated ? -((y * cfg.parallax.grid) % GRID_CELL) : 0
    const dotsT = animated ? -((y * cfg.parallax.dots) % DOT_CELL) : 0
    const gridX = this.pnx * pp.grid
    const gridY = gridT + this.pny * pp.grid
    const dotsX = this.pnx * pp.dots
    const dotsY = dotsT + this.pny * pp.dots
    if (Math.abs(gridY - this.lastGridT) > 0.15 || Math.abs(gridX - this.lastGridX) > 0.15 || Number.isNaN(this.lastGridT)) {
      this.lastGridT = gridY
      this.lastGridX = gridX
      this.layers.grid.style.transform = `translate3d(${gridX.toFixed(2)}px, ${gridY.toFixed(1)}px, 0)`
    }
    if (Math.abs(dotsY - this.lastDotsT) > 0.15 || Math.abs(dotsX - this.lastDotsX) > 0.15 || Number.isNaN(this.lastDotsT)) {
      this.lastDotsT = dotsY
      this.lastDotsX = dotsX
      this.layers.dots.style.transform = `translate3d(${dotsX.toFixed(2)}px, ${dotsY.toFixed(1)}px, 0)`
    }
    const gridO = Math.min(1, s.grid)
    if (Math.abs(gridO - this.lastGridO) > 0.01 || Number.isNaN(this.lastGridO)) {
      this.lastGridO = gridO
      this.layers.grid.style.opacity = gridO.toFixed(2)
    }
  }

  private update(dt: number, scrollDelta: number) {
    const { drift, scrollResponse } = cfg.motion
    const par = cfg.parallax.particles
    const vel = this.tracker.velocity
    const t = this.time * 0.001
    const w = this.w
    const h = this.h
    const m = 24
    for (let i = 0; i < this.count; i++) {
      const z = this.pz[i]
      const ph = this.pphase[i]
      // Idle drift with a gentle sinusoidal wander
      this.px[i] += (this.pvx[i] + Math.sin(t * 0.35 + ph) * 0.25) * drift * z * dt * 0.05
      this.py[i] += (this.pvy[i] + Math.cos(t * 0.3 + ph) * 0.2) * drift * z * dt * 0.05
      // Scroll parallax: nearer particles travel further against the scroll
      this.py[i] -= scrollDelta * par * z
      // Velocity response: a slight extra push in the scroll direction's opposite
      this.py[i] -= vel * scrollResponse * z * 0.35 * dt

      // Wrap around with a margin (respawn at the opposite edge)
      if (this.py[i] < -m) {
        this.py[i] = h + m
        this.px[i] = Math.random() * w
      } else if (this.py[i] > h + m) {
        this.py[i] = -m
        this.px[i] = Math.random() * w
      }
      if (this.px[i] < -m) this.px[i] = w + m
      else if (this.px[i] > w + m) this.px[i] = -m
    }
    this.updateCursorField(dt)
  }

  /**
   * Gentle, bounded cursor response: particles inside the radius are eased a
   * few px away and brighten; everything springs back smoothly when it leaves.
   */
  private updateCursorField(dt: number) {
    const pc = cfg.pointer.particles
    const R = this.mobile ? 0 : pc.radius
    const R2 = R * R
    const k = 1 - Math.pow(1 - pc.ease, dt)
    const cx = this.cursorX
    const cy = this.cursorY
    const pp = cfg.pointer.parallax
    for (let i = 0; i < this.count; i++) {
      const z = this.pz[i]
      // Compare against where the particle is drawn (including parallax)
      const par = pp.particlesFar + (pp.particlesNear - pp.particlesFar) * z
      const dx = this.px[i] + this.pnx * par - cx
      const dy = this.py[i] + this.pny * par - cy
      const d2 = dx * dx + dy * dy
      let tx = 0
      let ty = 0
      let lit = 0
      if (d2 < R2 && d2 > 0.01) {
        const d = Math.sqrt(d2)
        const f = 1 - d / R
        const ff = f * f
        tx = (dx / d) * ff * pc.push * (0.5 + z * 0.5)
        ty = (dy / d) * ff * pc.push * (0.5 + z * 0.5)
        lit = f
      }
      this.pox[i] += (tx - this.pox[i]) * k
      this.poy[i] += (ty - this.poy[i]) * k
      this.plit[i] += (lit - this.plit[i]) * k * 1.5
      this.qx[i] = this.px[i] + this.pox[i] + this.pnx * par
      this.qy[i] = this.py[i] + this.poy[i] + this.pny * par
    }
  }

  private draw() {
    const ctx = this.ctx
    const s = this.tracker.current
    const [tr, tg, tb] = s.tint
    const base = cfg.colors.particle
    // Mix the neutral particle colour 45% toward the section tint
    const r = Math.round(base[0] + (tr - base[0]) * 0.45)
    const g = Math.round(base[1] + (tg - base[1]) * 0.45)
    const b = Math.round(base[2] + (tb - base[2]) * 0.45)

    ctx.clearRect(0, 0, this.w, this.h)

    const linesEnabled = this.quality < 2
    const lineCount = this.mobile ? cfg.performance.mobile.lines : cfg.lines.count
    if (linesEnabled && s.lines > 0.02) this.drawLines(ctx, lineCount, r, g, b, s.lines)

    const linksEnabled = this.quality < 1 && (!this.mobile || cfg.performance.mobile.links)
    if (linksEnabled) this.drawLinks(ctx, r, g, b, s.particles)

    this.drawParticles(ctx, r, g, b, s.particles)
  }

  private drawLines(ctx: CanvasRenderingContext2D, count: number, r: number, g: number, b: number, k: number) {
    const { amplitude, speed, opacity } = cfg.lines
    const t = this.time * 0.001 * speed * 10
    const vel = Math.min(1, Math.abs(this.tracker.velocity) / 40)
    const amp = amplitude * (1 + vel * cfg.motion.scrollResponse * 2)
    const p = this.tracker.progress
    const step = this.mobile ? 32 : 22
    ctx.lineWidth = 1
    for (let i = 0; i < count; i++) {
      const baseY = this.h * (0.22 + 0.28 * i) + Math.sin(p * TAU + i * 1.7) * this.h * 0.08
      const lp = cfg.pointer.parallax.lines
      const ox = this.pnx * (lp[i % lp.length] ?? 10)
      const oy = this.pny * (lp[i % lp.length] ?? 10) * 0.6
      const f1 = 0.0022 + i * 0.0006
      const f2 = 0.0051 - i * 0.0007
      ctx.strokeStyle = `rgba(${r},${g},${b},${(opacity * k * (i === 1 ? 1.25 : 0.85)).toFixed(3)})`
      ctx.beginPath()
      for (let x = -step; x <= this.w + step; x += step) {
        const y =
          baseY +
          Math.sin(x * f1 + t + i * 2.1) * amp +
          Math.sin(x * f2 - t * 0.7 + i) * amp * 0.45 -
          this.tracker.velocity * 0.6 * (i + 1)
        if (x === -step) ctx.moveTo(x + ox, y + oy)
        else ctx.lineTo(x + ox, y + oy)
      }
      ctx.stroke()
    }
  }

  /** Connections between nearby particles, batched into a few alpha buckets (one stroke each). */
  private drawLinks(ctx: CanvasRenderingContext2D, r: number, g: number, b: number, k: number) {
    const maxD = cfg.particles.linkDistance * (this.mobile ? 0.8 : 1)
    const maxD2 = maxD * maxD
    const n = this.count
    const px = this.qx
    const py = this.qy
    const lit = this.plit
    const boost = cfg.pointer.particles.linkBoost
    ctx.lineWidth = 0.6
    for (let bucket = 0; bucket < LINK_BUCKETS; bucket++) {
      const lo = bucket / LINK_BUCKETS
      const hi = (bucket + 1) / LINK_BUCKETS
      ctx.beginPath()
      let any = false
      for (let i = 0; i < n; i++) {
        const xi = px[i]
        const yi = py[i]
        for (let j = i + 1; j < n; j++) {
          const dx = px[j] - xi
          if (dx > maxD || dx < -maxD) continue
          const dy = py[j] - yi
          if (dy > maxD || dy < -maxD) continue
          const d2 = dx * dx + dy * dy
          if (d2 > maxD2) continue
          // closeness 0..1 → bucket
          let c = 1 - Math.sqrt(d2) / maxD
          // Connections near the cursor read a little stronger
          const l = lit[i] > lit[j] ? lit[i] : lit[j]
          if (l > 0.01) c = Math.min(0.999, c + l * boost * (1 - c))
          if (c < lo || c >= hi) continue
          ctx.moveTo(xi, yi)
          ctx.lineTo(px[j], py[j])
          any = true
        }
      }
      if (any) {
        const a = cfg.particles.linkOpacity * k * ((lo + hi) / 2)
        ctx.strokeStyle = `rgba(${r},${g},${b},${a.toFixed(3)})`
        ctx.stroke()
      }
    }
  }

  /** Particles batched by depth (one fill per bucket). Fast scrolling stretches them slightly. */
  private drawParticles(ctx: CanvasRenderingContext2D, r: number, g: number, b: number, k: number) {
    const [minS, maxS] = cfg.particles.size
    const vel = this.tracker.velocity
    const stretch = Math.max(-18, Math.min(18, -vel * cfg.motion.scrollResponse * 0.6))
    const streaking = Math.abs(stretch) > 1.5
    for (let bucket = 0; bucket < DEPTH_BUCKETS; bucket++) {
      const lo = 0.25 + (0.75 * bucket) / DEPTH_BUCKETS
      const hi = 0.25 + (0.75 * (bucket + 1)) / DEPTH_BUCKETS
      const zMid = (lo + hi) / 2
      const alpha = cfg.particles.opacity * k * (0.35 + zMid * 0.65)
      const style = `rgba(${r},${g},${b},${alpha.toFixed(3)})`
      if (streaking) {
        ctx.strokeStyle = style
        ctx.lineCap = 'round'
        ctx.lineWidth = minS + (maxS - minS) * zMid
        ctx.beginPath()
      } else {
        ctx.fillStyle = style
        ctx.beginPath()
      }
      for (let i = 0; i < this.count; i++) {
        const z = this.pz[i]
        if (z < lo || (z >= hi && bucket < DEPTH_BUCKETS - 1)) continue
        const x = this.qx[i]
        const y = this.qy[i]
        if (streaking) {
          ctx.moveTo(x, y)
          ctx.lineTo(x, y + stretch * z)
        } else {
          const rad = minS + (maxS - minS) * z
          ctx.moveTo(x + rad, y)
          ctx.arc(x, y, rad, 0, TAU)
        }
      }
      if (streaking) ctx.stroke()
      else ctx.fill()
    }

    // Particles near the cursor: one extra, brighter pass (only the few inside the radius)
    let anyLit = false
    for (let i = 0; i < this.count; i++) if (this.plit[i] > 0.08) { anyLit = true; break }
    if (!anyLit) return
    const brighten = cfg.pointer.particles.brighten
    const accent = cfg.colors.accent
    ctx.beginPath()
    for (let i = 0; i < this.count; i++) {
      const l = this.plit[i]
      if (l <= 0.08) continue
      const rad = (minS + (maxS - minS) * this.pz[i]) * (1 + l * 0.6)
      ctx.moveTo(this.qx[i] + rad, this.qy[i])
      ctx.arc(this.qx[i], this.qy[i], rad, 0, TAU)
    }
    ctx.fillStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${(brighten * k).toFixed(3)})`
    ctx.fill()
  }

  /** Reduced motion: one complete frame, no loop. */
  private renderStatic() {
    if (this.needsResize) this.resize()
    this.tracker.sample(1, true)
    this.applyLayers(false)
    this.updateCursorField(1) // fills draw positions; no cursor influence when static
    const ctx = this.ctx
    const s = this.tracker.current
    const base = cfg.colors.particle
    const r = Math.round(base[0] + (s.tint[0] - base[0]) * 0.45)
    const g = Math.round(base[1] + (s.tint[1] - base[1]) * 0.45)
    const b = Math.round(base[2] + (s.tint[2] - base[2]) * 0.45)
    ctx.clearRect(0, 0, this.w, this.h)
    this.drawLines(ctx, this.mobile ? cfg.performance.mobile.lines : cfg.lines.count, r, g, b, 0.8)
    this.drawLinks(ctx, r, g, b, 0.8)
    this.drawParticles(ctx, r, g, b, 0.8)
  }
}
