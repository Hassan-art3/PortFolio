/**
 * Personal configuration — edit this file to update your identity and links.
 *
 * Any link left as an empty string is hidden on the site, so there are never
 * dead buttons. While running `npm run dev`, a small banner lists the fields
 * that still need a value.
 */
export interface SiteConfig {
  name: string
  role: string
  url: string
  links: {
    github: string
    email: string
    linkedin: string
    other: { label: string; href: string }
  }
  contactForm: {
    /**
     * Where the contact form POSTs messages. Uses FormSubmit (free, no API key):
     * the very first message sends a one-time confirmation email to the address
     * below — click the link in it once and later messages arrive normally.
     * Leave empty to fall back to opening the visitor's email app.
     */
    endpoint: string
  }
}

export const site: SiteConfig = {
  name: 'Hassan',
  /** Short role line. Kept factual: describes what you do, not a job title. */
  role: 'Android app developer',
  /** Production URL, used for canonical + social-sharing tags in index.html. */
  url: '',

  links: {
    github: 'https://github.com/Hassan-art3',
    /** No "mailto:" prefix */
    email: 'hassan03334748@gmail.com',
    /** e.g. 'https://www.linkedin.com/in/your-handle' */
    linkedin: '',
    /** Optional: any other profile (X, Mastodon, personal blog…) */
    other: { label: '', href: '' },
  },

  contactForm: {
    endpoint: 'https://formsubmit.co/ajax/hassan03334748@gmail.com',
  },
}

/** Config fields that are still empty — surfaced in a dev-only banner. */
export function missingConfig(): string[] {
  const missing: string[] = []
  if (!site.links.github) missing.push('links.github')
  if (!site.links.email) missing.push('links.email')
  if (!site.links.linkedin) missing.push('links.linkedin')
  if (!site.url) missing.push('url')
  return missing
}
