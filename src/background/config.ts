/**
 * Background configuration — tune the look here without touching the engine.
 *
 * The background is one fixed layer with four depths (back → front):
 *   1. glow fields   CSS radial gradients, moved/faded with transform + opacity
 *   2. dot field     slow parallax texture
 *   3. grid          faster parallax texture
 *   4. canvas        particles, connections and flowing lines (one rAF loop)
 */

export const backgroundConfig = {
  colors: {
    /** Page base — matches --bg in index.css. */
    base: '#0a0c0b',
    /** Particles, connections and lines blend toward the active section's tint. */
    particle: [214, 222, 216] as RGB,
    accent: [200, 245, 60] as RGB,
  },

  particles: {
    /** Particles per 10 000 px² of viewport, before caps. */
    density: 0.55,
    max: 110,
    min: 24,
    /** Radius range in CSS px (scaled by depth). */
    size: [0.7, 2.1] as [number, number],
    /** Max distance (px) for drawing a connection between two particles. */
    linkDistance: 130,
    linkOpacity: 0.2,
    opacity: 0.72,
  },

  motion: {
    /** Idle drift speed in px/second for the nearest layer. */
    drift: 9,
    /** How much scroll velocity pushes particles and bends lines (0 = none). */
    scrollResponse: 0.35,
    /** Smoothing for scroll velocity (0–1, higher = snappier). */
    velocitySmoothing: 0.12,
    /** Speed at which section atmospheres crossfade (0–1 per frame toward target). */
    sectionEase: 0.06,
  },

  parallax: {
    /** Fraction of scroll distance each layer moves (0 = fixed, 1 = moves with page). */
    glow: 0.04,
    dots: 0.1,
    grid: 0.22,
    /** Particle layer: near particles move this much, far ones less. */
    particles: 0.35,
  },

  lines: {
    count: 3,
    opacity: 0.11,
    /** Vertical amplitude in px. */
    amplitude: 70,
    speed: 0.05,
  },

  glow: {
    /** Global multiplier for glow field opacity. */
    intensity: 1,
  },

  performance: {
    /** Canvas resolution cap. */
    maxDpr: 1.5,
    /** Below this width the mobile profile applies. */
    mobileBreakpoint: 768,
    mobile: {
      maxParticles: 34,
      links: true,
      lines: 2,
      maxDpr: 1,
    },
    /** Idle (no scrolling for this long) → run the canvas at half rate. */
    idleAfterMs: 1800,
    /** If smoothed frame time exceeds this (ms), quality steps down. */
    slowFrameMs: 24,
  },

  /** Cursor reactions (desktop with a mouse/trackpad only). */
  pointer: {
    glow: {
      /** Diameter of the ambient cursor light in px. */
      size: 620,
      color: 'rgba(200, 245, 60, 0.11)',
      /** Base opacity while the pointer is on the page… */
      opacity: 0.75,
      /** …plus this much more while it moves quickly. */
      speedBoost: 0.25,
      /** 0–1 per frame: lower = more lag / "weight". */
      follow: 0.075,
    },
    /** Smoothing for parallax pointer input (0–1 per frame). */
    parallaxFollow: 0.06,
    /** Max parallax offset in px at the viewport edge, per layer (negative = opposite to cursor). */
    parallax: {
      grid: 5,
      dots: 3,
      glows: -26,
      particlesFar: 5,
      particlesNear: 16,
      lines: [8, 14, 22],
    },
    particles: {
      /** Interaction radius in px. */
      radius: 150,
      /** Max gentle displacement away from the cursor, px. */
      push: 20,
      /** Spring-back easing toward rest (0–1 per frame). */
      ease: 0.08,
      /** Extra opacity for particles near the cursor. */
      brighten: 0.55,
      /** How much nearby connections are boosted (0–1). */
      linkBoost: 0.6,
    },
  },

  /**
   * prefers-reduced-motion: 'static' draws one complete frame and only
   * crossfades the section lighting on scroll (no drifting or parallax).
   */
  reducedMotion: 'static' as 'static' | 'off',
}

export type RGB = [number, number, number]

/** Glow fields available to every section. Each has a fixed colour; sections only move and fade them. */
export const glowFields = [
  { id: 'lime', color: 'rgba(200, 245, 60, 0.20)', size: 820 },
  { id: 'teal', color: 'rgba(46, 196, 176, 0.17)', size: 760 },
  { id: 'blue', color: 'rgba(91, 155, 240, 0.16)', size: 900 },
  { id: 'gold', color: 'rgba(217, 180, 64, 0.13)', size: 700 },
  { id: 'violet', color: 'rgba(179, 155, 245, 0.13)', size: 760 },
] as const

export type GlowId = (typeof glowFields)[number]['id']

/** Position (viewport %, centre of the glow) and opacity (0–1) for one glow in one section. */
export type GlowState = { x: number; y: number; o: number }

export interface Atmosphere {
  /** Element id of the section this atmosphere belongs to. */
  section: string
  glows: Record<GlowId, GlowState>
  /** Tint applied to particles/lines in this section. */
  tint: RGB
  /** 0–1 multipliers for this section's emphasis. */
  particles: number
  lines: number
  grid: number
}

const off = (x: number, y: number): GlowState => ({ x, y, o: 0 })

/**
 * One atmosphere per section, in page order. The renderer interpolates between
 * neighbours based on scroll position, so transitions are continuous.
 */
export const atmospheres: Atmosphere[] = [
  {
    section: 'top',
    glows: {
      lime: { x: 72, y: 38, o: 1 },
      teal: { x: 18, y: 85, o: 0.35 },
      blue: off(90, 90),
      gold: off(60, 100),
      violet: off(10, 10),
    },
    tint: [200, 245, 60],
    particles: 1,
    lines: 1,
    grid: 1,
  },
  {
    section: 'projects',
    glows: {
      lime: { x: 12, y: 18, o: 0.35 },
      teal: { x: 85, y: 30, o: 0.7 },
      blue: { x: 70, y: 80, o: 0.8 },
      gold: off(30, 90),
      violet: off(10, 60),
    },
    tint: [120, 200, 220],
    particles: 0.75,
    lines: 0.8,
    grid: 0.8,
  },
  {
    section: 'case-studies',
    glows: {
      lime: off(50, 10),
      teal: { x: 15, y: 25, o: 0.35 },
      blue: { x: 88, y: 55, o: 0.45 },
      gold: { x: 40, y: 85, o: 0.75 },
      violet: off(80, 10),
    },
    tint: [217, 190, 110],
    particles: 0.55,
    lines: 0.5,
    grid: 0.6,
  },
  {
    section: 'journey',
    glows: {
      lime: { x: 20, y: 30, o: 0.45 },
      teal: { x: 78, y: 70, o: 0.6 },
      blue: off(90, 20),
      gold: off(60, 90),
      violet: { x: 45, y: 95, o: 0.55 },
    },
    tint: [150, 230, 190],
    particles: 0.85,
    lines: 1,
    grid: 1,
  },
  {
    section: 'skills',
    glows: {
      lime: { x: 82, y: 22, o: 0.7 },
      teal: off(10, 80),
      blue: { x: 15, y: 70, o: 0.6 },
      gold: off(50, 100),
      violet: { x: 60, y: 90, o: 0.3 },
    },
    tint: [170, 210, 140],
    particles: 0.9,
    lines: 0.7,
    grid: 1.1,
  },
  {
    section: 'about',
    glows: {
      lime: { x: 25, y: 35, o: 0.6 },
      teal: { x: 80, y: 60, o: 0.35 },
      blue: off(90, 90),
      gold: off(60, 100),
      violet: { x: 85, y: 15, o: 0.4 },
    },
    tint: [200, 220, 170],
    particles: 0.7,
    lines: 0.6,
    grid: 0.8,
  },
  {
    section: 'contact',
    glows: {
      lime: { x: 80, y: 80, o: 0.9 },
      teal: off(20, 90),
      blue: { x: 18, y: 35, o: 0.55 },
      gold: off(60, 10),
      violet: { x: 50, y: 10, o: 0.25 },
    },
    tint: [200, 245, 60],
    particles: 0.8,
    lines: 0.9,
    grid: 1,
  },
]
