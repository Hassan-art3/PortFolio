# Hassan — Android developer portfolio

A single-page portfolio built with React, TypeScript and Vite. No backend, no API keys.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

## Where to edit

| What | File |
| --- | --- |
| Name, GitHub, email, LinkedIn, site URL | `src/config/site.ts` |
| Projects, case studies, screenshots, links | `src/data/projects.ts` |
| Skills & tools | `src/data/skills.ts` |
| Timeline steps (add `date` when you want one) | `src/data/timeline.ts` |
| Colours, type scale, spacing, radii | `:root` tokens in `src/index.css` |
| Animation timing, easing, springs | `src/motion/tokens.ts` (mirrored as CSS vars in `index.css`) |
| Contact form destination | `contactForm.endpoint` in `src/config/site.ts` |
| SEO / social tags | `index.html` |

Empty links are hidden automatically, so there are no dead buttons. While `npm run dev` is
running, a small banner lists any config fields that are still empty.

### Contact form

Messages are posted to [FormSubmit](https://formsubmit.co) (free, no account or API key).
**Before relying on it, send one test message from the live site yourself:** FormSubmit emails a
one-time activation link to the address in `contactForm.endpoint`. Click it, and every message
after that is delivered to your inbox. If sending fails, the form offers an “Email me instead”
link. Leave `endpoint` empty to always use the visitor's email app.

### Motion

Built with [Motion for React](https://motion.dev) (`motion` package) plus CSS transitions and
keyframes. Shared building blocks live in `src/motion/`:

- `SplitText`: masked word-by-word heading reveals
- `Magnetic`: pointer-pull wrapper for buttons (desktop only)
- `hooks.ts`: pointer parallax, pointer spotlight, pausing infinite animations off-screen
- `tokens.ts`: durations, easings, springs, hero choreography and shared `inView` settings

Rich pointer effects run only on devices with a mouse/trackpad; scroll-linked parallax is
desktop-only; everything respects the OS “reduce motion” setting.

### Animated background

`src/background/` holds the persistent, scroll-reactive background:

- `config.ts`: colours, particle density, speeds, parallax, glow intensity, scroll response,
  mobile limits, reduced-motion behaviour, and one *atmosphere* per section (glow positions,
  tint, emphasis)
- `scrollTracker.ts`: scroll position/velocity plus continuous blending between section
  atmospheres (sampled once per frame, never inside scroll events)
- `renderer.ts`: one `requestAnimationFrame` loop for the canvas (particles, connections,
  flowing lines) and the CSS layers (glows, dots, grid), with idle half-rate, automatic quality
  step-down, DPR caps and pausing in hidden tabs
- `Background.tsx`: the fixed layer (`pointer-events: none`, behind all content)

To add a new section's atmosphere, give the section an `id` and add an entry to `atmospheres`
in page order.

### Adding screenshots

1. Put images in `public/projects/<project-id>/` (WebP, about 585×1266 for phone screens).
2. Add them to that project's `screens` array in `src/data/projects.ts`:
   `{ kind: 'image', src: '/projects/omnifile/home.webp', alt: 'OmniFile home screen' }`
3. Remove the `schematic` entry once a real screenshot replaces it.

### Things still to fill in

- `src/config/site.ts`: GitHub, email, LinkedIn and the deployed URL.
- Music player: everything in its entry in `projects.ts` is a placeholder.
- Real screenshots for OmniFile and ZenTime (they currently use labelled UI schematics).
- The `learned` lists in each case study are drafts; rewrite them in your own words.
- After deploying, change `og:image` in `index.html` to an absolute URL.

## Sources

Project facts were taken from the local source of each app: Gradle build files, manifests,
Kotlin/TypeScript sources and resource files. The Quran Companion screenshots come from its
built web bundle running at a phone-sized viewport.
