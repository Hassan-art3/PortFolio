import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { site } from '../config/site'
import { dur, ease, heroTimeline, spring } from '../motion/tokens'
import { Magnetic } from '../motion/Magnetic'
import { Icon } from './Icon'
import './Nav.css'

const links = [
  { href: '#projects', label: 'Projects', section: 'projects' },
  { href: '#case-studies', label: 'Case studies', section: 'case-studies' },
  { href: '#skills', label: 'Skills', section: 'skills' },
  { href: '#about', label: 'About', section: 'about' },
]

export function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [active, setActive] = useState<string>('')
  const [hovered, setHovered] = useState<string | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Scroll state: only sets state when a threshold is crossed, so scrolling
  // doesn't re-render the nav on every frame.
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    const isScrolled = y > 12
    if (isScrolled !== scrolled) setScrolled(isScrolled)
    const shouldHide = y > 480 && y > prev + 4
    const shouldShow = y < prev - 4 || y <= 480
    if (shouldHide && !hidden && !open) setHidden(true)
    else if (shouldShow && hidden) setHidden(false)
  })

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.section))
      .filter((el): el is HTMLElement => el !== null)
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  // Mobile menu: close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 860px)')
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const cta = site.links.github
    ? { href: site.links.github, label: 'GitHub', icon: 'github' as const, external: true }
    : { href: '#contact', label: 'Contact', icon: 'arrowRight' as const, external: false }

  // The pill follows hover first, then the section in view.
  const pill = hovered ?? active

  return (
    <m.header
      className={`nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}
      onFocus={() => setHidden(false)}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: hidden ? -96 : 0, opacity: 1 }}
      transition={{ duration: dur.reveal, ease: ease.out, delay: hidden ? 0 : heroTimeline.nav }}
    >
      <div className="nav__bar">
        <a href="#top" className="nav__brand" onClick={() => setOpen(false)}>
          <m.span
            className="nav__mark"
            aria-hidden="true"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...spring.press, delay: 0.2 }}
          >
            {site.name.charAt(0)}
          </m.span>
          <span>
            {site.name.toLowerCase()}
            <span className="nav__brand-dim">/android</span>
          </span>
        </a>

        <nav aria-label="Primary" className="nav__links">
          <ul onPointerLeave={() => setHovered(null)}>
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={active === l.section ? 'is-active' : undefined}
                  aria-current={active === l.section ? 'true' : undefined}
                  onPointerEnter={() => setHovered(l.section)}
                  onFocus={() => setHovered(l.section)}
                  onBlur={() => setHovered(null)}
                >
                  {pill === l.section && (
                    <m.span className="nav__pill" layoutId="nav-pill" transition={spring.indicator} />
                  )}
                  <span className="nav__label">{l.label}</span>
                  {active === l.section && (
                    <m.span className="nav__dot" layoutId="nav-dot" transition={spring.indicator} />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Magnetic strength={5}>
          <a
            href={cta.href}
            className="nav__cta"
            {...(cta.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <Icon name={cta.icon} size={16} />
            {cta.label}
          </a>
        </Magnetic>

        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="nav__burger" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            className="nav__sheet"
            initial={{ clipPath: 'inset(0 0 100% 0 round 20px)', opacity: 0.6 }}
            animate={{ clipPath: 'inset(0 0 0% 0 round 20px)', opacity: 1 }}
            exit={{ clipPath: 'inset(0 0 100% 0 round 20px)', opacity: 0, transition: { duration: 0.25, ease: ease.inOut } }}
            transition={{ duration: 0.45, ease: ease.expo }}
          >
            <nav aria-label="Mobile">
              <m.ul
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05, delayChildren: 0.08 } } }}
              >
                {[...links, { href: '#contact', label: 'Contact', section: 'contact' }].map((l, i) => (
                  <m.li
                    key={l.href}
                    variants={{
                      hidden: { opacity: 0, y: 16 },
                      visible: { opacity: 1, y: 0, transition: { duration: dur.standard, ease: ease.out } },
                    }}
                  >
                    <a href={l.href} onClick={() => setOpen(false)}>
                      <span className="mono">0{i + 1}</span>
                      {l.label}
                      <Icon name="arrowRight" size={20} className="nav__sheet-arrow" />
                    </a>
                  </m.li>
                ))}
              </m.ul>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  )
}
