import { useState } from 'react'
import { missingConfig } from '../config/site'

/** Dev-only reminder of empty config fields. Never rendered in production builds. */
export function DevConfigBanner() {
  const [hidden, setHidden] = useState(false)
  const missing = missingConfig()
  if (!import.meta.env.DEV || hidden || missing.length === 0) return null

  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 520,
        zIndex: 90,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px dashed var(--accent-line)',
        background: 'rgba(10,12,11,0.94)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}
    >
      <span style={{ flex: 1 }}>
        <b style={{ color: 'var(--accent)', fontWeight: 500 }}>dev</b> · Empty fields in src/config/site.ts (hidden on
        the site until filled): {missing.join(', ')}
      </span>
      <button type="button" onClick={() => setHidden(true)} style={{ color: 'var(--text)', padding: '0 4px' }}>
        Dismiss
      </button>
    </div>
  )
}
