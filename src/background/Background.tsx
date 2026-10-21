import { useEffect, useRef } from 'react'
import { backgroundConfig, glowFields } from './config'
import { BackgroundRenderer } from './renderer'
import './Background.css'

/**
 * Persistent, scroll-reactive page background.
 * A single fixed layer behind all content (pointer-events: none), so it can
 * never block clicks, selection or touch gestures.
 */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const glowRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const dots = dotsRef.current
    const grid = gridRef.current
    const cursor = cursorRef.current
    const glows = glowRefs.current.filter((g): g is HTMLDivElement => g !== null)
    if (!canvas || !dots || !grid || !cursor || glows.length !== glowFields.length) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let renderer: BackgroundRenderer
    try {
      renderer = new BackgroundRenderer({ canvas, glows, dots, grid, cursor }, { reducedMotion: mq.matches })
    } catch {
      // No canvas support: the CSS layers alone still give a complete background.
      return
    }
    renderer.start()
    const onChange = () => renderer.setReducedMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => {
      mq.removeEventListener('change', onChange)
      renderer.destroy()
    }
  }, [])

  return (
    <div className="bg" aria-hidden="true">
      <div className="bg__glows">
        {glowFields.map((g, i) => (
          <div
            key={g.id}
            ref={(el) => {
              glowRefs.current[i] = el
            }}
            className="bg__glow"
            style={{
              width: g.size,
              height: g.size,
              background: `radial-gradient(closest-side, ${g.color}, transparent)`,
            }}
          />
        ))}
      </div>
      <div className="bg__dots" ref={dotsRef} />
      <div className="bg__grid" ref={gridRef} />
      {/* Ambient cursor light: behind the canvas particles and all page content */}
      <div
        className="bg__cursor"
        ref={cursorRef}
        style={{
          width: backgroundConfig.pointer.glow.size,
          height: backgroundConfig.pointer.glow.size,
          background: `radial-gradient(closest-side, ${backgroundConfig.pointer.glow.color}, transparent)`,
        }}
      />
      <canvas className="bg__canvas" ref={canvasRef} />
      <div className="bg__vignette" />
    </div>
  )
}
