import { domMax, LazyMotion, MotionConfig } from 'motion/react'
import { Background } from './background/Background'
import { About } from './components/About'
import { CaseStudies } from './components/CaseStudies'
import { Contact } from './components/Contact'
import { DevConfigBanner } from './components/DevConfigBanner'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { ScrollProgress } from './components/ScrollProgress'
import { Skills } from './components/Skills'
import { Timeline } from './components/Timeline'

/**
 * Motion features load with the page (not lazily) so first-viewport animations
 * never wait on a second request, and nothing can get stuck hidden if that
 * request failed. `strict` keeps components on the lighter `m.*` API.
 * reducedMotion="user" honours the OS "reduce motion" setting everywhere.
 */
export default function App() {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <Background />
        <ScrollProgress />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Nav />
        <main id="main">
          <Hero />
          <Projects />
          <CaseStudies />
          <Timeline />
          <Skills />
          <About />
          <Contact />
        </main>
        <Footer />
        <DevConfigBanner />
      </MotionConfig>
    </LazyMotion>
  )
}
