import type { SchematicVariant } from '../data/projects'
import './Schematic.css'

/**
 * Wireframe-style screens used where real screenshots aren't available yet.
 * Labels (tabs, categories) come from each app's actual source code; no
 * numbers or data are shown, so nothing is implied that the app doesn't do.
 * Each one carries a visible "schematic" badge.
 */
interface Props {
  variant: SchematicVariant
  label: string
}

export function Schematic({ variant, label }: Props) {
  return (
    <div className={`schem schem--${variant}`} role="img" aria-label={label}>
      <span className="schem__badge">schematic</span>
      {variant === 'omnifile' && <OmniFileScreen />}
      {variant === 'zentime' && <ZenTimeScreen />}
      {variant === 'music' && <MusicScreen />}
    </div>
  )
}

function StatusBar() {
  return (
    <div className="schem__status" aria-hidden="true">
      <span />
      <span className="schem__status-icons">
        <i />
        <i />
        <i />
      </span>
    </div>
  )
}

function BottomNav({ items, active = 0 }: { items: string[]; active?: number }) {
  return (
    <div className="schem__nav" aria-hidden="true">
      {items.map((item, i) => (
        <span key={item} className={i === active ? 'is-active' : undefined}>
          <i />
          {item}
        </span>
      ))}
    </div>
  )
}

/* Category names from OmniFile's FileCategory enum; tabs from strings.xml. */
const omniCategories = ['Documents', 'PDFs', 'Images', 'Audio', 'Video', 'Archives', 'E-books', 'Code']

function OmniFileScreen() {
  return (
    <div className="schem__body" aria-hidden="true">
      <StatusBar />
      <div className="schem__title">OmniFile</div>
      <div className="schem__search">Search files</div>
      <div className="schem__label">Categories</div>
      <div className="schem__grid">
        {omniCategories.map((c) => (
          <span key={c} className="schem__cat">
            <i />
            {c}
          </span>
        ))}
      </div>
      <div className="schem__label">Recent</div>
      <div className="schem__rows">
        {[0.72, 0.55, 0.64].map((w, i) => (
          <span key={i} className="schem__row">
            <i />
            <b style={{ width: `${w * 100}%` }} />
          </span>
        ))}
      </div>
      <BottomNav items={['Home', 'Files', 'Categories', 'Favorites', 'Recent']} />
    </div>
  )
}

/* Tabs from ZenTime's NavDestination definitions. */
function ZenTimeScreen() {
  return (
    <div className="schem__body" aria-hidden="true">
      <StatusBar />
      <div className="schem__title">Dashboard</div>
      <div className="schem__ring">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" className="track" />
          <circle cx="50" cy="50" r="40" className="arc" pathLength="100" />
        </svg>
        <span>Screen time</span>
      </div>
      <div className="schem__label">Focus modes</div>
      <div className="schem__chips">
        <span className="is-on">Focus</span>
        <span>Shorts</span>
      </div>
      <div className="schem__label">Apps</div>
      <div className="schem__bars">
        {[0.82, 0.6, 0.44, 0.3].map((w, i) => (
          <span key={i}>
            <i />
            <b style={{ width: `${w * 100}%` }} />
          </span>
        ))}
      </div>
      <BottomNav items={['Dashboard', 'Apps', 'Shorts', 'Focus', 'Insights']} />
    </div>
  )
}

function MusicScreen() {
  return (
    <div className="schem__body schem__body--center" aria-hidden="true">
      <StatusBar />
      <div className="schem__art">
        <span>♪</span>
      </div>
      <div className="schem__line schem__line--lg" />
      <div className="schem__line" />
      <div className="schem__progress">
        <i />
      </div>
      <div className="schem__controls">
        <span />
        <span className="is-main" />
        <span />
      </div>
      <p className="schem__note">Screenshots coming soon</p>
    </div>
  )
}
