import type { CSSProperties } from 'react'
import type { Project } from '../data/projects'
import './ProjectIcon.css'

interface Props {
  project: Project
  size?: number
}

/** App icon: real asset when available, otherwise a monogram tile in the project accent. */
export function ProjectIcon({ project, size = 48 }: Props) {
  const { icon, accent, name } = project
  const style = { width: size, height: size, '--accent-p': accent } as CSSProperties

  if (icon.kind === 'image') {
    return (
      <span className="project-icon" style={style}>
        <img src={icon.src} alt="" width={size} height={size} loading="lazy" decoding="async" />
      </span>
    )
  }

  if (icon.kind === 'omnifile') {
    // Vector path taken from OmniFile's own launcher foreground drawable.
    return (
      <span className="project-icon project-icon--omnifile" style={style} aria-hidden="true">
        <svg viewBox="0 0 108 108" width={size} height={size}>
          <rect width="108" height="108" fill="#1565C0" />
          <g transform="translate(26 26)">
            <path
              fill="#fff"
              d="M28,4L4,28V56H28V40H44V56H68V28L44,4H28ZM28,14L40,26H16V44H28V40H44V44H52V26H28V14Z"
            />
          </g>
        </svg>
      </span>
    )
  }

  return (
    <span className="project-icon project-icon--mono" style={style} aria-hidden="true" title={name}>
      <span style={{ fontSize: size * 0.48 }}>{icon.text}</span>
    </span>
  )
}
