import { site } from '../config/site'
import { Icon } from './Icon'
import { Reveal } from './Reveal'
import './Footer.css'

const explore = [
  { label: 'Projects', href: '#projects' },
  { label: 'Case studies', href: '#case-studies' },
  { label: 'Journey', href: '#journey' },
  { label: 'Skills', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export function Footer() {
  const year = new Date().getFullYear()
  const { github, email } = site.links
  const hasElsewhere = Boolean(github || email)

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top-row">
          <Reveal className="footer__intro">
            <p className="footer__brand">
              <span className="nav__mark" aria-hidden="true">
                {site.name.charAt(0)}
              </span>
              <span>{site.name}</span>
            </p>
            <p className="footer__role">{site.role}</p>
          </Reveal>

          <Reveal className="footer__col" delay={80}>
            <nav aria-label="Footer">
              <p className="footer__label mono">Explore</p>
              <ul className="footer__list">
                {explore.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="footer__link">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          {hasElsewhere && (
            <Reveal className="footer__col" delay={160}>
              <p className="footer__label mono">Elsewhere</p>
              <ul className="footer__list">
                {github && (
                  <li>
                    <a href={github} className="footer__link" target="_blank" rel="noreferrer">
                      <Icon name="github" size={16} />
                      GitHub
                      <Icon name="arrowUpRight" size={14} />
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className="footer__link">
                      <Icon name="mail" size={16} />
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </Reveal>
          )}
        </div>

        <p className="footer__wordmark" aria-hidden="true">
          {site.name}
        </p>

        <div className="footer__inner">
          <p className="footer__meta mono">
            © {year} {site.name}
          </p>
          <p className="footer__meta mono">Built with React, TypeScript &amp; Vite</p>
          <a href="#top" className="footer__top">
            Back to top
            <Icon name="arrowUp" size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}
