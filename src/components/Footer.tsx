import { site } from '../config/site'
import { Icon } from './Icon'
import './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p className="footer__brand">
          <span className="nav__mark" aria-hidden="true">
            {site.name.charAt(0)}
          </span>
          <span>
            © {year} {site.name}
          </span>
        </p>
        <p className="footer__meta mono">Built with React, TypeScript &amp; Vite</p>
        <a href="#top" className="footer__top">
          Back to top
          <Icon name="arrowUp" size={16} />
        </a>
      </div>
    </footer>
  )
}
