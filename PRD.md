# Portfolio v2: Product Requirements & Architecture

**Owner:** Naveen Chand · **Author:** Claude · **Created:** 2026-10-01
**Status:** Approved 2026-10-01 (Naveen accepted every recommendation in §12). Phases 0–5 are built and tested locally. Phase 6 (launch) needs Naveen: GitHub repo, Vercel and Resend accounts.

---

## 1. Summary

Rebuild the current portfolio (v1, plain HTML/CSS/JS in this folder) as a **Next.js + React + TypeScript** app.
The design, content and motion stay the same: the liquid background, liquid page transitions, preloader, cursor and scroll animations.

What gets better:

| Area | v1 (today) | v2 (this plan) |
|---|---|---|
| Page changes | Full browser reload, hidden behind the wave | No reload. The liquid background stays alive and smoothly changes colour between pages |
| Code | 5 HTML files built by a Python script | Reusable React components with TypeScript types |
| Content | Text copied inside HTML | One typed data folder (`src/content`), the single source of truth |
| Contact form | Opens the visitor's email app (`mailto:`) | Sends the message straight to Naveen's Gmail (small backend, §7) |
| SEO | Basic meta tags | Per-page metadata, generated share images, sitemap, structured data |
| Quality | Manual checks | Type checks, lint, automated browser tests and CI on every push |

**Speed note:** the visitor experience stays about as fast as v1. Every page is still pre-rendered to static HTML. React adds a small JavaScript bundle, kept inside the budget in §2.

---

## 2. Goals, non-goals and success metrics

**Goals**
1. Reach 100% feature parity with v1 (checklist in Appendix A) on the new stack.
2. Keep one persistent WebGL liquid canvas across all pages, so transitions feel seamless.
3. Keep the content in typed files so a new project or certificate can be added in one place.
4. Make the contact form deliver to Gmail without the visitor leaving the site.
5. Deploy to Vercel from a **private** GitHub repo.

**Non-goals (v2)**
- No blog, no CMS, no database, no login.
- No project detail pages yet. The architecture leaves room for `/work/[slug]` later (§12, D5).
- No visual redesign. v2 should look like v1.

**Success metrics**

| Metric | Target |
|---|---|
| Lighthouse (mobile): Performance / Accessibility / Best Practices / SEO | ≥ 90 / ≥ 95 / ≥ 95 / 100 |
| Largest Contentful Paint (mobile, 4G) | ≤ 2.5 s |
| Cumulative Layout Shift | ≤ 0.05 |
| Interaction to Next Paint | ≤ 200 ms |
| First-load JavaScript, home page (gzip) | ≤ 250 KB. Revised from 180 KB after measuring: the Next.js + React runtime alone is ~150 KB and GSAP + Lenis ~60 KB. Measured: **242 KB** |
| Console errors on any page | 0 |
| v1 parity checklist (Appendix A) | 100% |

---

## 3. Current state (v1): the baseline to match

| Page | Main sections | Liquid palette |
|---|---|---|
| Home `/` | Hero (name, morphing photo, role rotor, scroll badge), tech marquee, intro scrub text, featured STOCK AI card, stats counters, explore list with hover preview | violet · teal · coral |
| About `/about` | Hero, bio with liquid-distort portrait, 4 "lanes" cards, journey timeline, Instagram gallery, leadership | rose · amber · violet |
| Work `/work` | Hero, pinned horizontal scroller with 6 projects (each with an animated canvas), "Research. Build. Ship." | mint · blue · lime |
| Stack `/stack` | Hero with orbiting tech rings, toolbox groups, ACE certificate + 7 certifications | blue · purple · cyan |
| Contact `/contact` | "Let's talk." hero, copy-email, availability cards, socials, message form | red · pink · gold |

Shared: nav, mobile menu, footer, "next page" link, cursor, grain, preloader, page transition. Scrolling to the end of a page opens the next one after a ~1 s countdown bar (cancelled by scrolling up; Contact, the last page, stays put).
v1 files: `index.html`, `about.html`, `work.html`, `stack.html`, `contact.html`, `css/style.css`, `js/liquid.js`, `js/main.js`, `js/visuals.js`, `src/`, `assets/`.

---

## 4. Tech stack

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | **Next.js** (App Router) | 16.3 | Industry standard for React sites; static pre-rendering plus serverless API routes; first-class on Vercel |
| UI library | **React** | 19.3 | Components and state; matches the résumé |
| Language | **TypeScript** (strict) | 6.0 | Type safety. TS 7 (the new native compiler) is adopted once Next.js supports it; checked in Phase 0 |
| Runtime / package manager | **Bun** | 1.4 | Fast installs and dev scripts. Next.js still runs on Node in production on Vercel |
| Styling | **Tailwind CSS** | 4.3 | Utility classes with design tokens in CSS (`@theme`); on the résumé |
| Animation | **GSAP** + ScrollTrigger + SplitText, `@gsap/react` | 3.15 / 2.1 | Same engine as v1; all plugins are free; `useGSAP` cleans up animations when a page unmounts |
| Smooth scroll | **Lenis** (`lenis/react`) | 1.3 | Same as v1, with a React provider |
| WebGL | Raw WebGL in a React component (see D2) | n/a | The liquid shader is about 5 KB. React Three Fiber would add about 150 KB for one full-screen quad |
| Fonts | `next/font/google`: Syne, Manrope, JetBrains Mono | n/a | Self-hosted at build time, no layout shift, no Google Fonts request at runtime |
| Images | `next/image` | n/a | Automatic AVIF/WebP, responsive sizes, lazy loading |
| Validation | **Zod** | 4.6 | One schema shared by the contact form and the API |
| Email (backend) | **Resend** | 6.x SDK | Simple email API with a free tier (§7) |
| Lint / format | **Biome** | 2.5 | One fast tool for lint and format |
| Tests | **Vitest** (unit) + **Playwright** (browser) | latest / 1.63 | Logic tests plus real-browser checks of pages, transitions and mobile layout |
| CI | GitHub Actions | n/a | Type check, lint, unit tests, build and e2e on every push |
| Hosting | **Vercel** (Hobby, free) | n/a | Same place as STOCK AI; preview URL for every branch |

---

## 5. Architecture overview

```
                         ┌──────────────────────────────────────────┐
  Visitor's browser ───▶ │  Vercel CDN                              │
                         │  • /, /about, /work, /stack, /contact     │  ← pre-rendered HTML (static)
                         │  • /_next/static/* (JS, CSS, fonts)       │
                         │  • /images/*, /Naveen_Chand_Resume.pdf    │
                         └──────────────────────────────────────────┘
                                         │  (only when the form is sent)
                                         ▼
                         ┌──────────────────────────────────────────┐
                         │  Vercel Function: POST /api/contact       │  ← the only backend code
                         │  validate (Zod) → spam checks → Resend    │
                         └──────────────────────────────────────────┘
                                         │
                                         ▼
                              Resend API ──▶ naveenchand01042002@gmail.com
```

**Inside the browser (client):**

```
<html data-page="home|about|work|stack|contact">
 └─ RootLayout  (mounted ONCE, survives every page change)
     ├─ SmoothScroll (Lenis ↔ ScrollTrigger)
     ├─ TransitionProvider (cover → navigate → reveal)
     │   ├─ LiquidCanvas   (one WebGL context; palette tweens per route)
     │   ├─ Grain, Cursor, Preloader (first visit per session)
     │   ├─ Nav, MobileMenu
     │   ├─ {page}  ← only this part changes between routes
     │   ├─ NextPageLink, Footer
     │   └─ TransitionOverlay (SVG wave + page label)
```

Rule of thumb: **section markup is rendered on the server** (fast HTML, good SEO). Small **client components** wrap it only where motion or interaction is needed (`<Reveal>`, `<SplitReveal>`, `<Magnetic>`, and so on).

---

## 6. Frontend architecture

### 6.1 Routes

| Route | File | Rendering | Palette key | Next page |
|---|---|---|---|---|
| `/` | `src/app/page.tsx` | Static | `home` | About |
| `/about` | `src/app/about/page.tsx` | Static | `about` | Work |
| `/work` | `src/app/work/page.tsx` | Static | `work` | Stack |
| `/stack` | `src/app/stack/page.tsx` | Static | `stack` | Contact |
| `/contact` | `src/app/contact/page.tsx` | Static | `contact` | Home |
| `/api/contact` | `src/app/api/contact/route.ts` | Serverless function | n/a | n/a |
| 404 | `src/app/not-found.tsx` | Static | `home` | Home |

Order, labels and palettes live in one file, `src/content/routes.ts`, used by the nav, the transition label, the next-page link and the shader.

### 6.2 Folder structure

```
portfolio/
├─ PRD.md · BACKEND.md · README.md
├─ legacy/                         # v1 static site, kept for reference until parity, then deleted
├─ public/
│  ├─ images/                      # naveen.jpg, team.jpg, candid.jpg, iit-ism.jpg, temple.jpg, stockai.jpg, ace-certificate.jpg
│  ├─ Naveen_Chand_Resume.pdf
│  └─ favicon.svg
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                # <html>, fonts, metadata defaults, persistent layer
│  │  ├─ globals.css               # Tailwind v4 + @theme tokens + a few keyframes
│  │  ├─ page.tsx · about/ · work/ · stack/ · contact/   # one page.tsx each
│  │  ├─ not-found.tsx
│  │  ├─ api/contact/route.ts      # backend (see BACKEND.md)
│  │  ├─ opengraph-image.tsx       # generated share image
│  │  ├─ sitemap.ts · robots.ts
│  ├─ components/
│  │  ├─ layout/    Nav · MobileMenu · Footer · NextPageLink
│  │  ├─ motion/    LiquidCanvas · TransitionProvider · TransitionLink · TransitionOverlay
│  │  │             Preloader · Cursor · SmoothScroll · Reveal · SplitReveal · ScrubText
│  │  │             Counter · Magnetic · Marquee · TiltCard · LiquidImage
│  │  ├─ sections/
│  │  │  ├─ home/    Hero · Intro · FeaturedProject · Stats · ExploreList
│  │  │  ├─ about/   AboutHero · Bio · Lanes · Timeline · Gallery · Leadership
│  │  │  ├─ work/    WorkHero · ProjectScroller · ProjectPanel · ProjectVisual · Process
│  │  │  ├─ stack/   StackHero · Orbit · Toolbox · Certifications
│  │  │  └─ contact/ ContactHero · Availability · Socials · ContactForm
│  │  └─ ui/        Pill · Chip · Label · RollText · Icon
│  ├─ content/      profile.ts · projects.ts · skills.ts · certifications.ts
│  │                timeline.ts · gallery.ts · routes.ts
│  ├─ lib/
│  │  ├─ gsap.ts               # registers GSAP plugins once
│  │  ├─ shaders/liquid.ts     # vertex + fragment shader strings
│  │  ├─ visuals/              # canvas scenes: stock.ts · nft.ts · defi.ts · forensics.ts
│  │  ├─ contact-schema.ts     # Zod schema shared by form and API
│  │  └─ env.ts                # typed, validated server env vars
│  └─ hooks/        useReducedMotion · useIsTouch · useSessionFlag
├─ tests/
│  ├─ unit/         content.test.ts · contact-schema.test.ts · contact-route.test.ts
│  └─ e2e/          pages.spec.ts · transitions.spec.ts · mobile.spec.ts · contact.spec.ts
├─ .github/workflows/ci.yml
├─ .env.example
└─ next.config.ts · tsconfig.json · biome.json · playwright.config.ts · package.json · bun.lock
```

### 6.3 Content model (single source of truth)

All facts come from `~/job-search/PRD.md` §2 and the résumé. No invented claims.

```ts
// src/content/projects.ts
export type Project = {
  slug: 'stock-ai' | 'nft-vault' | 'defi-vault' | 'cyber-trigger';
  title: string;
  tagline: string;
  context: string;            // "Final-year project", "Smart India Hackathon", …
  period: string;             // "Jul 2026 – present"
  summary: string;
  highlights: string[];
  tech: string[];
  visual: 'stock' | 'nft' | 'defi' | 'forensics';
  screenshot?: { src: string; alt: string };
  links: { live?: string; repo?: string };
  featured?: boolean;
};

// src/content/routes.ts
export type RouteKey = 'home' | 'about' | 'work' | 'stack' | 'contact';
export const routes: Record<RouteKey, {
  href: string; label: string; index: string;
  palette: [string, string, string];   // fed to the liquid shader
  accent: string;                       // CSS accent colour
  next: RouteKey; nextKicker: string;
}> = { /* … */ };
```

The other files follow the same pattern: `profile.ts` (name, roles, links, email, location, availability), `skills.ts` (groups → items), `certifications.ts` (name, issuer, year, image?), `timeline.ts` (period, title, body, tag), `gallery.ts` (src, alt, caption, date). A Vitest test checks that every image path exists and every link is a valid URL.

### 6.4 Motion system: how each v1 effect moves to React

| Effect | v2 implementation |
|---|---|
| **Liquid background** | `<LiquidCanvas>` (client) is mounted once in the root layout. The v1 WebGL shader is ported as is (domain-warped fbm, mouse drag, sheen). It reads the current route's palette and tweens the uniforms over about 1.6 s. Runs at half resolution, pauses when the tab is hidden, and falls back to a CSS gradient if WebGL isn't available. |
| **Page transition** | `<TransitionLink>` replaces `<a>` for internal links. On click: (1) the provider plays the cover timeline (two SVG wave paths plus the page label, as in v1); (2) `router.push(href, { scroll: false })` and `lenis.scrollTo(0, { immediate: true })`; (3) when `usePathname()` changes and the new page has painted, `ScrollTrigger.refresh()` runs, then the drip-away reveal plays; (4) the provider sets `entered = true`, which starts the page intro. Next.js prefetches routes, so step 2 is near-instant. |
| **Back / forward buttons** | No cover; palette tween and a quick fade-in reveal only. |
| **Preloader** | Once per browser session (`sessionStorage`), on whichever page the visitor lands first. Same counter plus gradient-fill name. |
| **Split-text reveals** | GSAP **SplitText** (free since 3.13) inside `<SplitReveal>`; it replaces v1's hand-written splitter and keeps screen-reader text intact. |
| **Scroll animations** | `<Reveal>`, `<ScrubText>`, `<Counter>` use ScrollTrigger inside `useGSAP({ scope })`, so every trigger is removed automatically when the page unmounts (no leaks between routes). |
| **Smooth scroll** | `<ReactLenis root>` in `SmoothScroll`, with `lenis.on('scroll', ScrollTrigger.update)` and GSAP's ticker driving Lenis, as in v1. |
| **Horizontal project scroller** | `gsap.matchMedia()`: pinned horizontal scrubbing on screens ≥ 901 px, normal vertical stack on smaller screens. |
| **Project canvases** | `<ProjectVisual scene="stock">` is loaded with `next/dynamic` (client-only) and only animates while visible (IntersectionObserver). Scene logic is ported from v1 into `lib/visuals/*.ts`. |
| **Cursor, magnetic, tilt, liquid image** | Small client components. All are disabled on touch devices and when reduced motion is on. |
| **Hero title auto-fit** | `useLayoutEffect` measures the two lines after fonts load and scales the font to fit (v1 `fitHero`). |
| **Reduced motion** | `useReducedMotion()` turns transitions into a crossfade, freezes the shader to a still frame, and skips the preloader, scrub and parallax effects. |

### 6.5 Styling

- Tailwind v4 with tokens in `globals.css` under `@theme`: colours (`--color-bg`, `--color-ink`, `--color-line`, …), fonts, easing curves and radii.
- The per-page accent is a CSS variable set from `routes.ts` on `<html data-page>`. The provider updates it during the transition.
- Complex pieces (grain, blob keyframes, marquee, orbit rings, roll-text) stay as small CSS blocks in `globals.css`; everything else uses utility classes.
- The site is dark only, by design.

### 6.6 SEO and sharing

- The `metadata` export per page sets title, description, canonical URL and Open Graph/Twitter tags.
- `opengraph-image.tsx` generates a 1200×630 share card (name, role, photo, gradient) at build time.
- `sitemap.ts` and `robots.ts` are generated automatically.
- JSON-LD `Person` schema adds name, job title, alumniOf (MSIT), sameAs (LinkedIn, GitHub, X) and the email.

### 6.7 Accessibility

- A skip link, a visible focus ring, semantic landmarks and one `h1` per page.
- Split text keeps an `aria-label` with the full sentence; decorative canvases use `aria-hidden`.
- The mobile menu traps focus, closes on Esc and has correct `aria-expanded`.
- Text contrast is at least 4.5:1 over the darkened shader (the shader dims under content, as in v1).
- Every motion effect respects `prefers-reduced-motion`.

### 6.8 Performance strategy

- Every page is static HTML; only interactive parts hydrate.
- GSAP plugins load once (`lib/gsap.ts`); project canvases are lazy-loaded on `/work` and `/` only.
- The hero photo uses `next/image` with `priority`; other images lazy-load in AVIF/WebP.
- Fonts are self-hosted with `display: swap` and preloaded subsets.
- The shader renders at 0.5× resolution (0.42× on phones) and stops when the tab is hidden.
- Budgets in §2 are checked by `next build` output and Lighthouse in Phase 5.

---

## 7. Backend architecture (summary)

A backend **is** used, but it's tiny: **one serverless endpoint** for the contact form. No database, no login, no stored data.

`POST /api/contact` → validate with Zod → spam checks (honeypot, time-to-submit, rate limit) → send through Resend → reply `{ ok: true }`.
If the backend fails or isn't configured, the form falls back to a `mailto:` link, so a message is never lost.

Full spec: **[BACKEND.md](BACKEND.md)**.

---

## 8. Tooling, quality and CI

| Command (Bun) | What it does |
|---|---|
| `bun install` | Install dependencies |
| `bun dev` | Local dev server at http://localhost:3000 |
| `bun run build` | Production build (shows the size of every route) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | `biome check .` |
| `bun run test` | Vitest unit tests |
| `bun run e2e` | Playwright: Chromium desktop and Pixel-7 mobile viewports |

**CI (`.github/workflows/ci.yml`)** runs on every push and pull request: install → typecheck → lint → unit → build → e2e (Playwright against `next start`). A pull request can't be merged if CI is red.

**E2E coverage:**
- Every route renders with no console errors.
- Nav transitions reach the right page and the overlay ends hidden.
- Back/forward works.
- The mobile menu works.
- No horizontal overflow at 390 px.
- The contact form succeeds against a mocked API.
- Reduced motion shows all content.

---

## 9. Hosting and deployment

1. A **private** GitHub repo `naveenchand01/portfolio`. Naveen creates it or gives access; Claude never handles passwords.
2. Vercel project linked to the repo:
   - `main` deploys to production.
   - Every other branch gets a preview URL.
3. Env vars are set in the Vercel dashboard (`RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`). They are never committed; `.env.example` documents them.
4. URL: `<project>.vercel.app` at first. A custom domain is optional later (§12, D4).

---

## 10. Delivery plan

Each phase ends with a working site, a commit, and a short check-in with Naveen.

| Phase | Deliverable | Done when |
|---|---|---|
| **0. Scaffold** | v1 moved to `legacy/`; Next.js app created with Bun; Tailwind, Biome, Vitest, Playwright and CI set up; TS 7 compatibility checked | `bun dev` shows a blank page; CI is green |
| **1. Foundation** | Tokens, fonts, `content/*` data, layout, Nav, MobileMenu, Footer, NextPageLink, all 5 pages with full content and **no motion** | Every page shows the right text and images on desktop and mobile |
| **2. Motion core** | LiquidCanvas (persistent), SmoothScroll, TransitionProvider and overlay, Preloader, Cursor, SplitReveal, Reveal | Navigating between pages never reloads; the liquid colour flows between pages; e2e transition tests pass |
| **3. Page parity** | Hero auto-fit, rotor, marquee, scrub, counters, explore preview, timeline, gallery, horizontal scroller, project canvases, orbit, tilt, liquid image | Appendix A checklist is 100% |
| **4. Backend** | `/api/contact` and the connected form, with mailto fallback | A test message from the live preview reaches Gmail |
| **5. Hardening** | SEO (metadata, OG image, sitemap, JSON-LD), accessibility pass, performance tuning, full test suite | §2 metrics met on the preview URL |
| **6. Launch** | Push to the private repo, Vercel production deploy, final check | Live URL works on Naveen's phone and laptop; `legacy/` removed after Naveen OKs |

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Next.js App Router has no built-in exit animations | Custom `TransitionProvider` controls the timing (cover first, then `router.push`); this pattern doesn't depend on experimental APIs |
| ScrollTriggers leaking between pages | Every trigger is created inside `useGSAP({ scope })`, so it's cleaned up on unmount; refresh runs after each page enter |
| WebGL slow or missing on old phones | Lower resolution on small screens; CSS gradient fallback; pause when hidden |
| Bundle grows past the budget | Lazy-load canvases; keep raw WebGL (no three.js); check sizes each phase |
| TypeScript 7 not yet supported by Next.js | Pin TS 6.0; revisit after Phase 0 |
| Contact spam | Honeypot, minimum time-to-submit and a rate limit; Upstash or Vercel Firewall only if spam shows up (BACKEND.md) |
| Facts drifting from the résumé | All facts live in `src/content`; Naveen reviews that folder once in Phase 1 |

---

## 12. Decisions (all resolved 2026-10-01: Naveen chose every recommendation)

| # | Question | Options | Claude's recommendation |
|---|---|---|---|
| **D1** | Contact form backend? | (a) Real email via Resend, (b) keep `mailto:` only (no backend at all) | **(a)**: recruiters can message without leaving the site. Needs a free Resend account that Naveen creates |
| **D2** | Shader technology? | (a) Raw WebGL component (about 5 KB), (b) React Three Fiber (about 150 KB, shows R3F skills) | **(a)**: same visual result, much lighter |
| **D3** | Where to build? | (a) In this folder, v1 moved to `legacy/`, (b) a new folder `portfolio-next/` | **(a)**: one project, one repo |
| **D4** | Custom domain? | (a) `*.vercel.app` for now, (b) buy a domain such as `naveenchand.dev` (about ₹1,000/yr) | **(a)** now, (b) later if wanted |
| **D5** | Add project detail pages (`/work/stock-ai` …)? | (a) Not in v2, (b) include now | **(a)**: parity first; the content model already supports it |
| **D6** | Install Bun on this PC? | Yes / No (fall back to npm) | **Yes**: `powershell -c "irm bun.sh/install.ps1 \| iex"`, run by Naveen or by Claude with approval |

## 13. Content to confirm (carried over from v1)

1. LinkedIn and GitHub handles: the site uses `naveenchand01`, from the job-search PRD. The résumé shows `/naveenchand` and `@naveen-chand`.
2. Repo links for NFT Vault, DeFi Vault and Cyber Trigger. They currently point to the GitHub profile.
3. Instagram photo captions ("Visiting IIT (ISM) Dhanbad", "Weekend wandering").
4. Phone number stays off the public site unless Naveen asks otherwise.

---

## Appendix A: v1 → v2 parity checklist

- [ ] Liquid WebGL background with mouse drag and per-page palettes
- [ ] Palette flows between pages (v2: without reload)
- [ ] Wave page transition with page label; drip-away reveal
- [ ] First-visit preloader (counter + gradient name fill)
- [ ] Custom cursor (dot, ring, labels like "View", "Go", "Hello")
- [ ] Magnetic buttons, roll-text hover on nav and pills
- [ ] Nav hides on scroll down and shows on scroll up; mobile menu with circular reveal
- [ ] Home: hero split-text intro, morphing photo blob, auto-fit title, role rotor, spinning scroll badge
- [ ] Home: velocity-skewed marquee, scrub intro text, featured card, counters, explore list with hover preview
- [ ] About: liquid-distort portrait, tilt cards with pointer glow, timeline rail fill, horizontal gallery drift, leadership cards
- [ ] Work: pinned horizontal scroller with progress bar; 6 animated canvases; vertical stack on mobile
- [ ] Stack: orbit rings with upright labels, tag hover fills, certificate shine, certifications list
- [ ] Contact: copy email, availability cards, socials hover, message form
- [ ] Next-page link and footer with live Bengaluru clock on every page
- [ ] Grain overlay; reduced-motion support; no horizontal overflow at 390 px
