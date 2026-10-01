# Naveen Chand: Portfolio v2

A multi-page, liquid motion-graphics portfolio built with **Next.js 16, React 19, TypeScript, Tailwind CSS 4, GSAP and WebGL**, run with **Bun**.

- Plan and architecture: [PRD.md](PRD.md)
- Contact-form backend: [BACKEND.md](BACKEND.md)
- The original static version (v1) lives in `legacy/` until v2 goes live.

## Quick start

```bash
bun install
bun dev            # http://localhost:3000
```

| Command | What it does |
|---|---|
| `bun dev` | Dev server with hot reload |
| `bun run build` / `bun run start` | Production build / serve it |
| `bun run typecheck` | TypeScript (strict) |
| `bun run lint` / `bun run format` | Biome lint / auto-format |
| `bun run test` | Unit tests (Vitest) |
| `bun run e2e` | Browser tests (Playwright, desktop + Pixel 7). Run `bun run build` first |

## How it works (the 30-second version)

- **Liquid background** (`src/components/motion/LiquidCanvas.tsx`, shader in `src/lib/shaders/liquid.ts`): a WebGL fragment shader layers fractal noise on itself ("domain warping") so it looks like flowing paint. The mouse drags the field, and each page has its own three colours.
- **Page transitions without reloads** (`src/components/motion/TransitionProvider.tsx`): clicking a link plays an SVG wave over the screen, then `router.push()` swaps the page underneath, then the wave drips away and the new page's intro plays. The canvas is mounted once in the root layout, so it never restarts; its colours just blend to the new page.
- **Scroll animations** (`src/components/motion/primitives.tsx`): GSAP ScrollTrigger, created inside `useGSAP()` so everything is cleaned up when a page unmounts. Lenis provides smooth scrolling and feeds ScrollTrigger.
- **Content** (`src/content/*.ts`): every fact on the site lives in typed data files. Edit those to add a project, certificate or photo.
- **Backend** (`src/app/api/contact/route.ts`): the only server code. It validates the contact form with Zod, filters bots, rate-limits, and emails Naveen through Resend.

## Environment variables

Copy `.env.example` to `.env.local`. Without `RESEND_API_KEY`, the contact form falls back to opening the visitor's email app.

## Deploy

Push to a private GitHub repo, import it on vercel.com, add the env vars from `.env.example`, and set `NEXT_PUBLIC_SITE_URL` to the production URL.
