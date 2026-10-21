import type { Screen } from '../data/projects'
import { Schematic } from './Schematic'
import './PhoneMockup.css'

interface Props {
  screen: Screen
  className?: string
  /** Set for above-the-fold images so they aren't lazy-loaded. */
  eager?: boolean
}

export function PhoneMockup({ screen, className = '', eager = false }: Props) {
  return (
    <figure className={`phone ${className}`.trim()}>
      <div className="phone__screen">
        {screen.kind === 'image' ? (
          <img
            src={screen.src}
            alt={screen.alt}
            width={585}
            height={1266}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <Schematic variant={screen.variant} label={screen.alt} />
        )}
        <span className="phone__camera" aria-hidden="true" />
      </div>
    </figure>
  )
}
