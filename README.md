# Hassan — Android Developer Portfolio

A personal portfolio site for **Hassan**, an Android app developer. It presents four projects with case studies, a skills overview, a timeline and a contact form, wrapped in a motion-heavy, cursor- and scroll-reactive design.

Built with **React**, **TypeScript**, **Vite** and **Motion**. It is a fully static site: no backend, no API keys.

---

## Projects featured

| Project | Stage | Built with |
| --- | --- | --- |
| **OmniFile** | In development | Kotlin, Jetpack Compose, Material 3, Room, WorkManager, SAF |
| **ZenTime** | In development | Kotlin, Jetpack Compose, UsageStatsManager, AccessibilityService, Room, DataStore |
| **Quran Companion** | In development | TypeScript, React, Capacitor, Tailwind CSS, Dexie, Kotlin |
| **Music Player** | Details coming soon | — |

Each technology listed comes from the project's own source code. Project content lives in [`src/data/projects.ts`](src/data/projects.ts).

## Features

- **Project showcases and case studies.** Phone mockups use real screenshots where they exist and clean schematic screens where they don't.
- **Motion design.** Split-text headline reveals, staggered entrances, magnetic buttons and spring-based device entrances, all built with [Motion](https://motion.dev).
- **Scroll-reactive background.** A canvas background that responds to scroll position and speed, with section-aware colour shifts.
- **Cursor-reactive environment.** One shared pointer tracker drives the hero parallax, card tilt, spotlight glows and screenshot parallax.
- **Accessible by default.**
  - Every effect respects `prefers-reduced-motion`.
  - Pointer effects only run on devices with a fine pointer (mouse or trackpad).
  - Uses semantic landmarks and a visible focus style.
- **Performance-minded.**
  - Pointer and scroll work writes to motion values or CSS variables once per frame, without React re-renders.
  - Infinite animations pause when off screen.
- **Contact form without a backend**, powered by [FormSubmit](https://formsubmit.co).
- **SEO and sharing.** Meta description, Open Graph image, favicon and Apple touch icon.

## Tech stack

- [React 19](https://react.dev) and [TypeScript](https://www.typescriptlang.org)
- [Vite 6](https://vite.dev) for the dev server and build
- [Motion 12](https://motion.dev) for animation
- Plain CSS with design tokens (custom properties)
- ESLint 9

## Getting started

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/Hassan-art3/PortFolio-.git
cd PortFolio-
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Project structure

```
public/                 Static files: favicon, OG image, project screenshots
src/
  config/site.ts        Name, role, links, contact form endpoint
  data/
    projects.ts         Projects and case-study content
    skills.ts           Skills section
    timeline.ts         Timeline section
  components/           Page sections (Hero, Projects, Contact, ...) and their CSS
  motion/               Motion helpers: SplitText, Magnetic, hooks, timing tokens
  background/           Scroll-reactive canvas background
  pointer/pointer.ts    Shared cursor tracker used by all pointer effects
```

## Customising

Most changes only need edits to a few files:

| To change | Edit |
| --- | --- |
| Name, role, GitHub, email, LinkedIn, site URL | `src/config/site.ts` |
| Projects, case studies, screenshots | `src/data/projects.ts` and `public/projects/` |
| Skills | `src/data/skills.ts` |
| Timeline | `src/data/timeline.ts` |
| Background colours and behaviour | `src/background/config.ts` |
| Animation timings and easing | `src/motion/tokens.ts` |

**Adding screenshots:** put images (WebP recommended) in `public/projects/<project-id>/`, then reference them in that project's `screens` array in `projects.ts`. Projects without screenshots fall back to schematic screens.

## Contact form

The form posts to FormSubmit's AJAX endpoint, which is set in `src/config/site.ts` (`contactForm.endpoint`). FormSubmit sends a one-time activation email to the receiving address the first time the form is used. Messages are delivered after that email is confirmed.

## Deployment

`npm run build` outputs a static site to `dist/`. You can host it on any static host, such as GitHub Pages, Netlify, Vercel or Cloudflare Pages.

- For **GitHub Pages** under a project path (e.g. `/PortFolio-/`), set `base: '/PortFolio-/'` in `vite.config.ts` before building.
- After deploying, set `url` in `src/config/site.ts` to the live address. Also set absolute URLs for `og:url` and `og:image` in `index.html`.

## Contact

- GitHub: [@Hassan-art3](https://github.com/Hassan-art3)
- Email: [hassan03334748@gmail.com](mailto:hassan03334748@gmail.com)
